"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const db = common_vendor.Ys.database();
const dbCmd = db.command;
common_vendor.Ys.databaseForJQL();
const _sfc_main = {
  data() {
    return {
      large_photo: "",
      showModal: false,
      queryWhere: "",
      collectionList: null,
      postList: null,
      usersTmp: null,
      question: null,
      loadMore: {
        contentdown: "",
        contentrefresh: "",
        contentnomore: ""
      },
      answers: null,
      answersCount: 0,
      sortBy: "time",
      sortDirection: "desc",
      answerContent: "",
      selectedImages: [],
      currentUser: {
        _id: ""
      },
      best_answer_user_id: null,
      question_user_id: null,
      replyContent: "",
      currentReplyTo: null,
      replyPlaceholder: "写下你的评论...",
      solved: false
    };
  },
  onLoad(e) {
    this._id = e.id;
  },
  onReady() {
    if (this._id) {
      this.queryWhere = '_id=="' + this._id + '"';
      this.question = db.collection("questions").where(`_id=="${this._id}"`).getTemp();
      this.usersTmp = db.collection("uni-id-users").field("_id,nickname,avatar_file").getTemp();
      this.collectionList = [this.question, this.usersTmp];
      this.getAnswers();
      this.currentUser._id = common_vendor.Ys.getCurrentUserInfo().uid;
      db.collection("questions").where(`_id=="${this._id}"`).get().then((res) => {
        this.question_user_id = res.result.data[0].user_id;
        this.solved = res.result.data[0].had_answer;
        if (this.solved) {
          this.best_answer_user_id = res.result.data[0].best_answer_user_id;
        }
      });
    }
  },
  methods: {
    // 处理回复点击
    handleReply(answer) {
      this.currentReplyTo = answer;
      if (answer.user_id._id === this.currentUser._id) {
        this.replyPlaceholder = "说点什么";
      } else
        this.replyPlaceholder = `回复 ${answer.user_id.nickname}`;
      this.$refs.replyPopup.open();
    },
    handleReplyClick(reply) {
      this.currentReplyTo = reply;
      if (reply.reply_to && reply.reply_to._id === this.currentUser._id) {
        this.replyPlaceholder = "说点什么";
      } else
        this.replyPlaceholder = `回复 ${reply.user_id.nickname}`;
      this.$refs.replyPopup.open();
    },
    timestampToDate(ts) {
      if (!ts)
        return "";
      const date = new Date(ts);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 6e4) {
        return "刚刚";
      }
      if (diff < 36e5) {
        return Math.floor(diff / 6e4) + "分钟前";
      }
      if (diff < 864e5) {
        return Math.floor(diff / 36e5) + "小时前";
      }
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    async submitReply() {
      if (!this.currentUser._id) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      try {
        const db2 = common_vendor.Ys.database();
        const answersCollection = db2.collection("answers");
        let parentId = this.currentReplyTo._id;
        if (this.currentReplyTo.parent_id) {
          parentId = this.currentReplyTo.parent_id;
        }
        const replyData = {
          content: this.replyContent,
          parent_id: parentId,
          reply_to: this.currentReplyTo.user_id._id,
          // 添加被回复者的id
          question_id: this._id
        };
        await answersCollection.add(replyData);
        await this.getAnswers();
        this.replyContent = "";
        this.currentReplyTo = null;
        this.$refs.replyPopup.close();
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "none"
        });
      } catch (error) {
        console.error("回复失败:", error);
        common_vendor.index.showToast({
          title: "回复失败",
          icon: "none"
        });
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    handleUpdate() {
      common_vendor.index.navigateTo({
        url: "./edit?id=" + this._id,
        events: {
          refreshData: () => {
            this.$refs.udb.loadData({
              clear: true
            });
            this.getAnswers();
          }
        }
      });
    },
    // 修改 getAnswers 方法以包含回复数据和用户信息
    async getAnswers() {
      try {
        let extractUserIds = function(answers) {
          answers.forEach((answer) => {
            if (answer.user_id && answer.user_id.length > 0) {
              userIds.add(answer.user_id);
            }
            if (answer.children && answer.children.length > 0) {
              answer.children.forEach((reply) => {
                if (reply.user_id && reply.user_id.length > 0) {
                  userIds.add(reply.user_id);
                }
                if (reply.reply_to && reply.reply_to.length > 0) {
                  userIds.add(reply.reply_to);
                }
              });
            }
          });
        }, attachUserInfo = function(answers) {
          answers.forEach((answer) => {
            if (answer.user_id && answer.user_id.length > 0) {
              answer.user_id = userMap[answer.user_id];
            }
            if (answer.children && answer.children.length > 0) {
              answer.children.forEach((reply) => {
                if (reply.user_id && reply.user_id.length > 0) {
                  reply.user_id = userMap[reply.user_id];
                }
                if (reply.reply_to && reply.reply_to.length > 0) {
                  reply.reply_to = userMap[reply.reply_to];
                }
              });
            }
          });
        };
        let answerTmp = null;
        await db.collection("answers").where(`question_id == "${this._id}"`).orderBy(this.sortBy, this.sortDirection).get().then((res) => {
          answerTmp = res.result.data;
        });
        const answerMap = {};
        answerTmp.forEach((answer) => {
          answer.children = [];
          answerMap[answer._id] = answer;
        });
        const rootAnswers = [];
        answerTmp.forEach((answer) => {
          if (answer.parent_id) {
            if (answerMap[answer.parent_id]) {
              answerMap[answer.parent_id].children.push(answer);
            }
          } else {
            rootAnswers.push(answer);
          }
        });
        const userIds = /* @__PURE__ */ new Set();
        extractUserIds(rootAnswers);
        let userInfo = null;
        await db.collection("uni-id-users").where({
          _id: dbCmd.in([...userIds])
        }).field("_id, nickname, avatar_file").get().then((res) => {
          userInfo = res.result.data;
        });
        const userMap = {};
        userInfo.forEach((user) => {
          userMap[user._id] = user;
        });
        attachUserInfo(rootAnswers);
        this.answers = rootAnswers;
        this.answersCount = rootAnswers.length;
      } catch (error) {
        console.error("获取回答失败:", error);
      }
    },
    // 获取排序字段
    getSortField() {
      return this.sortBy === "time" ? "time" : "like_count";
    },
    // 切换排序方式
    async changeSort(type) {
      if (this.sortBy === type) {
        this.sortDirection = this.sortDirection === "desc" ? "asc" : "desc";
      } else {
        this.sortBy = type;
        this.sortDirection = "desc";
      }
      await this.getAnswers();
    },
    enlarge_photo(file) {
      this.large_photo = file.url;
      this.showModal = true;
    },
    recover_photo() {
      this.showModal = false;
    },
    async chooseImage() {
      if (this.selectedImages.length >= 3) {
        common_vendor.index.showToast({
          title: "最��只能选择3张图片",
          icon: "none"
        });
        return;
      }
      try {
        const res = await common_vendor.index.chooseImage({
          count: 3 - this.selectedImages.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        this.selectedImages = [...this.selectedImages, ...res.tempFilePaths];
      } catch (e) {
        console.error(e);
      }
    },
    async submitAnswer() {
      if (!this.answerContent && !this.selectedImages.length) {
        common_vendor.index.showToast({
          title: "请输入回答内容或上传图片",
          icon: "none"
        });
        return;
      }
      const imageUrls = [];
      if (this.selectedImages.length) {
        for (let path of this.selectedImages) {
          const res = await common_vendor.Ys.uploadFile({
            filePath: path,
            cloudPath: `answers/${Date.now()}-${Math.random()}.jpg`
          });
          imageUrls.push({
            url: res.fileID
          });
        }
      }
      await db.collection("answers").add({
        question_id: this._id,
        content: this.answerContent,
        images: imageUrls,
        user_id: this.user_id
      });
      this.getAnswers();
      this.answerContent = "";
      this.selectedImages = [];
      this.$refs.answerPopup.close();
    },
    isLiked(answer) {
      if (!answer.liked_users)
        return false;
      return answer.liked_users.includes(this.currentUser._id);
    },
    // 处理点赞/取消点赞
    async likeAnswer(answer) {
      if (!this.currentUser._id) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      try {
        const db2 = common_vendor.Ys.database();
        const answersCollection = db2.collection("answers");
        const isLiked = this.isLiked(answer);
        const userId = this.currentUser._id;
        let updateData = {};
        if (!isLiked) {
          updateData = {
            like_count: (answer.like_count || 0) + 1,
            liked_users: answer.liked_users ? [...answer.liked_users, userId] : [userId]
          };
        } else {
          updateData = {
            like_count: Math.max(0, (answer.like_count || 1) - 1),
            liked_users: (answer.liked_users || []).filter((id) => id !== userId)
          };
        }
        await answersCollection.doc(answer._id).update(updateData);
        answer.like_count = updateData.like_count;
        answer.liked_users = updateData.liked_users;
        common_vendor.index.showToast({
          title: isLiked ? "已取消点赞" : "点赞成功",
          icon: "none"
        });
      } catch (error) {
        console.error("点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    difficultyClass(difficulty) {
      return {
        easy: difficulty === 0,
        medium: difficulty === 1,
        hard: difficulty === 2
      };
    },
    difficultyText(difficulty) {
      return difficulty === 0 ? "简单" : difficulty === 1 ? "中等" : "困难";
    },
    categoryText(category) {
      return category === "math" ? "数学题" : category === "code" ? "编程题" : category === "resource" ? "求资料" : "其他";
    },
    handleInputFocus() {
      this.$refs.answerPopup.open();
    },
    handlePopupChange(e) {
      if (!e.show) {
        this.tempContent = "";
      }
    },
    deleteImage(index) {
      this.selectedImages.splice(index, 1);
    },
    acceptAnswer(answer) {
      db.collection("questions").where(`_id=="${this._id}"`).update({
        best_answer_user_id: answer.user_id._id,
        had_answer: true
      });
      this.getAnswers();
      this.solved = true;
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_unicloud_db2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_unicloud_db = () => "../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more + _easycom_unicloud_db + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.goBack),
    b: common_vendor.p({
      type: "left",
      size: "24"
    }),
    c: common_vendor.w(({
      data,
      loading,
      error
    }, s0, i0) => {
      return common_vendor.e({
        a: error
      }, error ? {
        b: common_vendor.t(error.message)
      } : loading ? {
        d: "3d73e30e-2-" + i0 + ",3d73e30e-1",
        e: common_vendor.p({
          contentText: $data.loadMore,
          status: "loading"
        })
      } : data ? common_vendor.e({
        g: data.user_id[0].avatar_file.url,
        h: common_vendor.t(data.user_id[0].nickname),
        i: common_vendor.t(data.title),
        j: common_vendor.t(data.descrip),
        k: data.had_answer
      }, data.had_answer ? {
        l: common_assets._imports_0$1
      } : {}, {
        m: common_vendor.f(data.images, (file, j, i1) => {
          return common_vendor.e({
            a: file.fileType === "image"
          }, file.fileType === "image" ? {
            b: common_vendor.o(($event) => $options.enlarge_photo(file)),
            c: file.url
          } : {}, $data.showModal ? {
            d: common_vendor.o(($event) => $options.recover_photo()),
            e: $data.large_photo
          } : {});
        }),
        n: $data.showModal,
        o: common_vendor.t($options.difficultyText(data.difficulties)),
        p: common_vendor.n($options.difficultyClass(data.difficulties)),
        q: common_vendor.t($options.categoryText(data.category))
      }) : {}, {
        c: loading,
        f: data,
        r: i0,
        s: s0
      });
    }, {
      name: "d",
      path: "c",
      vueId: "3d73e30e-1"
    }),
    d: common_vendor.sr("udb", "3d73e30e-1"),
    e: common_vendor.p({
      collection: $data.collectionList,
      where: $data.queryWhere,
      getone: true,
      manual: true
    }),
    f: common_vendor.t($data.answersCount),
    g: $data.sortBy === "time"
  }, $data.sortBy === "time" ? {
    h: common_vendor.t($data.sortDirection === "desc" ? "↓" : "↑")
  } : {}, {
    i: common_vendor.n($data.sortBy === "time" ? "active" : ""),
    j: common_vendor.o(($event) => $options.changeSort("time")),
    k: $data.sortBy === "like_count"
  }, $data.sortBy === "like_count" ? {
    l: common_vendor.t($data.sortDirection === "desc" ? "↓" : "↑")
  } : {}, {
    m: common_vendor.n($data.sortBy === "like_count" ? "active" : ""),
    n: common_vendor.o(($event) => $options.changeSort("like_count")),
    o: common_vendor.f($data.answers, (answer, index, i0) => {
      return common_vendor.e({
        a: answer.user_id.avatar_file
      }, answer.user_id.avatar_file ? {
        b: answer.user_id.avatar_file.url
      } : {}, {
        c: common_vendor.t(answer.user_id.nickname),
        d: common_vendor.t($options.timestampToDate(answer.time)),
        e: common_vendor.t(answer.content),
        f: answer.images && answer.images.length
      }, answer.images && answer.images.length ? {
        g: common_vendor.f(answer.images, (img, i, i1) => {
          return {
            a: i,
            b: img.url,
            c: common_vendor.o(($event) => $options.enlarge_photo(img), i)
          };
        })
      } : {}, {
        h: answer.user_id._id === $data.best_answer_user_id
      }, answer.user_id._id === $data.best_answer_user_id ? {
        i: common_assets._imports_1
      } : {}, {
        j: answer.children && answer.children.length
      }, answer.children && answer.children.length ? {
        k: common_vendor.f(answer.children, (reply, replyIndex, i1) => {
          return common_vendor.e({
            a: reply.reply_to && reply.reply_to._id === reply.user_id._id
          }, reply.reply_to && reply.reply_to._id === reply.user_id._id ? {
            b: common_vendor.t(reply.user_id.nickname || _ctx.游客)
          } : {
            c: common_vendor.t(reply.user_id.nickname || _ctx.游客),
            d: common_vendor.t(reply.reply_to.nickname || _ctx.游客)
          }, {
            e: common_vendor.t(reply.content),
            f: replyIndex,
            g: common_vendor.o(($event) => $options.handleReplyClick(reply), replyIndex)
          });
        })
      } : {}, {
        l: "3d73e30e-3-" + i0,
        m: common_vendor.p({
          type: "hand-up",
          size: "20",
          color: $options.isLiked(answer) ? "#007AFF" : "#666"
        }),
        n: common_vendor.t(answer.like_count || 0),
        o: $options.isLiked(answer) ? "#007AFF" : "#666",
        p: common_vendor.o(($event) => $options.likeAnswer(answer), index),
        q: "3d73e30e-4-" + i0,
        r: common_vendor.o(($event) => $options.handleReply(answer), index),
        s: $data.currentUser._id == $data.question_user_id && !$data.solved && $data.question_user_id != answer.user_id._id
      }, $data.currentUser._id == $data.question_user_id && !$data.solved && $data.question_user_id != answer.user_id._id ? {
        t: "3d73e30e-5-" + i0,
        v: common_vendor.p({
          type: "checkmarkempty"
        }),
        w: common_vendor.o(($event) => $options.acceptAnswer(answer), index)
      } : {}, {
        x: index
      });
    }),
    p: common_vendor.p({
      type: "chat",
      size: "20"
    }),
    q: common_vendor.o((...args) => $options.handleInputFocus && $options.handleInputFocus(...args)),
    r: $data.answerContent,
    s: common_vendor.o(($event) => $data.answerContent = $event.detail.value),
    t: $data.answerContent,
    v: common_vendor.o(($event) => $data.answerContent = $event.detail.value),
    w: $data.selectedImages.length
  }, $data.selectedImages.length ? {
    x: common_vendor.f($data.selectedImages, (image, index, i0) => {
      return {
        a: image,
        b: common_vendor.o(($event) => $options.deleteImage(index), index),
        c: index
      };
    })
  } : {}, {
    y: common_vendor.o($options.chooseImage),
    z: common_vendor.p({
      type: "image",
      size: "24",
      color: "#666"
    }),
    A: $data.selectedImages.length
  }, $data.selectedImages.length ? {
    B: common_vendor.t($data.selectedImages.length)
  } : {}, {
    C: !$data.answerContent && !$data.selectedImages.length,
    D: common_vendor.o((...args) => $options.submitAnswer && $options.submitAnswer(...args)),
    E: common_vendor.sr("answerPopup", "3d73e30e-6"),
    F: common_vendor.o($options.handlePopupChange),
    G: common_vendor.p({
      type: "bottom"
    }),
    H: $data.replyPlaceholder,
    I: $data.replyContent,
    J: common_vendor.o(($event) => $data.replyContent = $event.detail.value),
    K: !$data.replyContent,
    L: common_vendor.o((...args) => $options.submitReply && $options.submitReply(...args)),
    M: common_vendor.sr("replyPopup", "3d73e30e-8"),
    N: common_vendor.p({
      type: "bottom"
    }),
    O: $data.showModal
  }, $data.showModal ? {
    P: $data.large_photo,
    Q: common_vendor.o(() => {
    }),
    R: common_vendor.o((...args) => $options.recover_photo && $options.recover_photo(...args)),
    S: common_vendor.o((...args) => $options.recover_photo && $options.recover_photo(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
