"use strict";
const common_vendor = require("../../common/vendor.js");
const js_sdk_validator_questions = require("../../js_sdk/validator/questions.js");
const db = common_vendor.Ys.database();
const dbCollectionName = "questions";
function getValidator(fields) {
  let result = {};
  for (let key in js_sdk_validator_questions.validator) {
    if (fields.indexOf(key) > -1) {
      result[key] = js_sdk_validator_questions.validator[key];
    }
  }
  return result;
}
const _sfc_main = {
  data() {
    let formData = {
      "title": "",
      "descrip": "",
      "difficulties": null,
      "category": "",
      "images": [],
      "is_stick": null
    };
    return {
      formData,
      formOptions: {
        "difficulties_localdata": [
          {
            "text": "简单",
            "value": 0
          },
          {
            "text": "中等",
            "value": 1
          },
          {
            "text": "困难",
            "value": 2
          }
        ],
        "category_localdata": [
          {
            "text": "数学题",
            "value": "math"
          },
          {
            "text": "编程题",
            "value": "code"
          },
          {
            "text": "求资料",
            "value": "resource"
          },
          {
            "text": "其他",
            "value": "other"
          }
        ]
      },
      rules: {
        ...getValidator(Object.keys(formData))
      }
    };
  },
  onReady() {
    this.$refs.form.setRules(this.rules);
  },
  methods: {
    /**
     * 验证表单并提交
     */
    submit() {
      common_vendor.index.showLoading({
        mask: true
      });
      this.$refs.form.validate().then((res) => {
        return this.submitForm(res);
      }).catch(() => {
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    /**
     * 提交表单
     */
    submitForm(value) {
      return db.collection(dbCollectionName).add(value).then((res) => {
        common_vendor.index.showToast({
          icon: "none",
          title: "新增成功"
        });
        this.getOpenerEventChannel().emit("refreshData");
        setTimeout(() => common_vendor.index.navigateBack(), 500);
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_file_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_file_picker + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $data.formData.title = $event),
    b: common_vendor.p({
      placeholder: "标题",
      modelValue: $data.formData.title
    }),
    c: common_vendor.p({
      name: "title",
      label: "标题"
    }),
    d: common_vendor.o(($event) => $data.formData.descrip = $event),
    e: common_vendor.p({
      placeholder: "描述你的问题",
      modelValue: $data.formData.descrip
    }),
    f: common_vendor.p({
      name: "descrip",
      label: "详情"
    }),
    g: common_vendor.o(($event) => $data.formData.difficulties = $event),
    h: common_vendor.p({
      localdata: $data.formOptions.difficulties_localdata,
      modelValue: $data.formData.difficulties
    }),
    i: common_vendor.p({
      name: "difficulties",
      label: "难度"
    }),
    j: common_vendor.o(($event) => $data.formData.category = $event),
    k: common_vendor.p({
      localdata: $data.formOptions.category_localdata,
      modelValue: $data.formData.category
    }),
    l: common_vendor.p({
      name: "category",
      label: "类型"
    }),
    m: common_vendor.o(($event) => $data.formData.images = $event),
    n: common_vendor.p({
      ["file-mediatype"]: "image",
      ["file-extname"]: "jpg,png",
      limit: 3,
      ["return-type"]: "array",
      modelValue: $data.formData.images
    }),
    o: common_vendor.p({
      name: "images",
      label: "添加照片"
    }),
    p: common_vendor.o(($event) => _ctx.binddata("is_stick", $event.detail.value)),
    q: $data.formData.is_stick,
    r: common_vendor.p({
      name: "is_stick",
      label: "置顶"
    }),
    s: common_vendor.o((...args) => $options.submit && $options.submit(...args)),
    t: common_vendor.sr("form", "7a87ceae-0"),
    v: common_vendor.p({
      model: $data.formData,
      ["validate-trigger"]: "submit",
      ["err-show-type"]: "toast"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
