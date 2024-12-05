<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validate-trigger="submit" err-show-type="toast">
      <uni-forms-item name="title" label="标题">
        <uni-easyinput placeholder="标题" v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="descrip" label="详情">
        <uni-easyinput placeholder="描述你的问题" v-model="formData.descrip"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="difficulties" label="难度">
        <uni-data-checkbox v-model="formData.difficulties" :localdata="formOptions.difficulties_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="category" label="类型">
        <uni-data-checkbox v-model="formData.category" :localdata="formOptions.category_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="images" label="添加照片">
        <uni-file-picker file-mediatype="image" file-extname="jpg,png" :limit="3" return-type="array" v-model="formData.images"></uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="is_stick" label="置顶">
        <switch @change="binddata('is_stick', $event.detail.value)" :checked="formData.is_stick"></switch>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" @click="submit">提交</button>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/questions.js';

  const db = uniCloud.database();
  const dbCollectionName = 'questions';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.indexOf(key) > -1) {
        result[key] = validator[key]
      }
    }
    return result
  }

  

  export default {
    data() {
      let formData = {
        "title": "",
        "descrip": "",
        "difficulties": null,
        "category": "",
        "images": [],
        "is_stick": null
      }
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
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            icon: 'none',
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("title,descrip,difficulties,category,images,is_stick").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
            
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>

<style>
  .uni-container {
    padding: 15px;
  }

  .uni-input-border,
  .uni-textarea-border {
    width: 100%;
    font-size: 14px;
    color: #666;
    border: 1px #e5e5e5 solid;
    border-radius: 5px;
    box-sizing: border-box;
  }

  .uni-input-border {
    padding: 0 10px;
    height: 35px;

  }

  .uni-textarea-border {
    padding: 10px;
    height: 80px;
  }

  .uni-button-group {
    margin-top: 50px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    justify-content: center;
  }

  .uni-button {
    width: 184px;
  }
</style>
