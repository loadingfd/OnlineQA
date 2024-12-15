"use strict";
const common_vendor = require("../../common/vendor.js");
const db = common_vendor.Ys.database();
const _sfc_main = {
  data() {
    return {
      loadMore: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多数据了"
      },
      timeFilter: 0,
      pastTime: 0,
      searchKeyword: "",
      dbWhere: {},
      field: "title,time,descrip,difficulties,category,is_stick,user_id{nickname,avatar_file}",
      questionsTemp: null,
      usersTemp: null,
      colList: null
    };
  },
  created() {
    this.setTimeFilter(0);
    this.usersTemp = db.collection("uni-id-users").field("_id,nickname,avatar_file").getTemp();
    this.colList = [this.questionsTemp, this.usersTemp];
  },
  onPullDownRefresh() {
    this.$refs.udb.loadData({
      clear: true
    }, () => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    this.$refs.udb.loadMore();
  },
  methods: {
    updateQtmp() {
      {
        this.questionsTemp = db.collection("questions").where(`time >= ${0}`).field("title,time,descrip,difficulties,category,is_stick,user_id").getTemp();
      }
      this.colList = [this.questionsTemp, this.usersTemp];
    },
    handleItemClick(id) {
      common_vendor.index.navigateTo({
        url: "./detail?id=" + id
      });
    },
    fabClick() {
      common_vendor.index.navigateTo({
        url: "./add",
        events: {
          refreshData: () => {
            this.$refs.udb.loadData({
              clear: true
            });
          }
        }
      });
    },
    handleTimeFilterChange(e) {
      this.timeFilter = e.currentIndex;
      this.setTimeFilter(e.currentIndex);
    },
    setTimeFilter(index) {
      const days = index === 0 ? 1 : 3;
      const pastTime = /* @__PURE__ */ new Date();
      pastTime.setDate(pastTime.getDate() - (days - 1));
      pastTime.setHours(0, 0, 0, 0);
      this.pastTime = pastTime.getTime();
      this.dbWhere = this.getSearchWhere();
      this.updateQtmp();
    },
    handleSearch(e) {
      this.dbWhere = this.getSearchWhere();
    },
    getSearchWhere() {
      if (this.searchKeyword) {
        let keywordReg = new RegExp(this.searchKeyword, "i");
        return `(${keywordReg}.test("title") || ${keywordReg}.test("descrip"))`;
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  const _easycom_uni_fab2 = common_vendor.resolveComponent("uni-fab");
  (_easycom_uni_search_bar2 + _easycom_uni_segmented_control2 + _easycom_uni_list_item2 + _easycom_uni_list2 + _easycom_uni_load_more2 + _easycom_unicloud_db2 + _easycom_uni_fab2)();
}
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_unicloud_db = () => "../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
const _easycom_uni_fab = () => "../../uni_modules/uni-fab/components/uni-fab/uni-fab.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_segmented_control + _easycom_uni_list_item + _easycom_uni_list + _easycom_uni_load_more + _easycom_unicloud_db + _easycom_uni_fab)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.handleSearch),
    b: common_vendor.o(($event) => $data.searchKeyword = $event),
    c: common_vendor.p({
      placeholder: "搜索问题",
      modelValue: $data.searchKeyword
    }),
    d: common_vendor.o($options.handleTimeFilterChange),
    e: common_vendor.p({
      current: $data.timeFilter,
      values: ["最近一天", "最近三天"]
    }),
    f: common_vendor.w(({
      data,
      loading,
      hasMore,
      error
    }, s0, i0) => {
      return common_vendor.e({
        a: error
      }, error ? {
        b: common_vendor.t(error.message)
      } : common_vendor.e({
        c: data && data.length
      }, data && data.length ? {
        d: common_vendor.f(data, (item, index, i1) => {
          return common_vendor.e({
            a: item.user_id[0].avatar_file.url,
            b: common_vendor.t(item.user_id[0].nickname),
            c: item.is_stick
          }, item.is_stick ? {} : {}, {
            d: common_vendor.t(item.title.length > 15 ? item.title.substring(0, 15) + "..." : item.title),
            e: common_vendor.t(item.descrip.substring(0, 100)),
            f: common_vendor.t(item.descrip.length > 100 ? "..." : ""),
            g: common_vendor.t(item.difficulties === 0 ? "简单" : item.difficulties === 1 ? "中等" : "困难"),
            h: item.difficulties === 0 ? 1 : "",
            i: item.difficulties === 1 ? 1 : "",
            j: item.difficulties === 2 ? 1 : "",
            k: common_vendor.t(item.category === "math" ? "数学题" : item.category === "code" ? "编程题" : item.category === "resource" ? "求资料" : "其他"),
            l: index,
            m: common_vendor.o(($event) => $options.handleItemClick(item._id), index),
            n: "31457c46-4-" + i0 + "-" + i1 + "," + ("31457c46-3-" + i0)
          });
        }),
        e: common_vendor.p({
          showArrow: true,
          clickable: true
        }),
        f: "31457c46-3-" + i0 + ",31457c46-2"
      } : !loading ? {} : {}, {
        g: !loading
      }), {
        h: "31457c46-5-" + i0 + ",31457c46-2",
        i: common_vendor.p({
          status: loading ? "loading" : hasMore ? "more" : "noMore"
        }),
        j: i0,
        k: s0
      });
    }, {
      name: "d",
      path: "f",
      vueId: "31457c46-2"
    }),
    g: common_vendor.sr("udb", "31457c46-2"),
    h: common_vendor.p({
      collection: $data.colList,
      where: $data.dbWhere,
      field: $data.field,
      getone: false,
      getcount: true,
      orderby: "is_stick desc,time desc"
    }),
    i: common_vendor.sr("fab", "31457c46-6"),
    j: common_vendor.o($options.fabClick),
    k: common_vendor.p({
      horizontal: "right",
      vertical: "bottom",
      ["pop-menu"]: false
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
