<template>
    <view class="uni-container">
      <uni-forms ref="form" :model="formData" validate-trigger="submit" err-show-type="toast">
        <uni-forms-item :required="true" name="title" label="标题">
          <uni-easyinput placeholder="标题" v-model="formData.title"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item :required="true" name="descrip" label="详情">
          <uni-easyinput type="textarea" autoHeight placeholder="描述你的问题" v-model="formData.descrip"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item :required="true" name="difficulties" label="难度">
          <uni-data-checkbox v-model="formData.difficulties" :localdata="formOptions.difficulties_localdata"></uni-data-checkbox>
        </uni-forms-item>
        <uni-forms-item :required="true" name="category" label="类型">
          <uni-data-checkbox v-model="formData.category" :localdata="formOptions.category_localdata"></uni-data-checkbox>
        </uni-forms-item>
        <uni-forms-item name="images" label="添加照片">
          <uni-file-picker file-mediatype="image" file-extname="jpg,png" :limit="3" return-type="array" v-model="formData.images"></uni-file-picker>
        </uni-forms-item>
        <uni-forms-item name="is_stick" label="置顶">
          <switch @change="handleSwitchChange" :checked="formData.is_stick"></switch>
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
            { "text": "简单", "value": 0 },
            { "text": "中等", "value": 1 },
            { "text": "困难", "value": 2 }
          ],
          "category_localdata": [
            { "text": "数学题", "value": "math" },
            { "text": "编程题", "value": "code" },
            { "text": "求资料", "value": "resource" },
            { "text": "其他", "value": "other" }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        },
        stick_costs: 0,
        current_user: null
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      async tryToStickQuestion() {
        const userInfo = uniCloud.getCurrentUserInfo();
        if (userInfo.tokenExpired < Date.now()) {
          uni.showToast({ title: '请先登录', icon: 'none' });
          return false;
        }
        this.current_user = userInfo;
        let user = null;
        try {
          const res = await db.collection('uni-id-users')
            .where(`_id == "${userInfo.uid}"`)
            .field('_id, stick_costs, workhour')
            .get();
          user = res.result.data[0];
        } catch (error) {
          console.error('获取用户信息失败', error);
          return false;
        }
  
        if (!user.stick_costs) user.stick_costs = 0;
        if (!user.workhour) user.workhour = 0;
  
        if (user.stick_costs + this.difficultiesToTime(this.formData.difficulties) > user.workhour) {
          uni.showModal({
            title: '工时不足',
            content: `当前已花费: ${user.stick_costs}分钟工时\n还需要${-(user.workhour - user.stick_costs - this.difficultiesToTime(this.formData.difficulties))}分钟工时`,
            showCancel: false
          });
          return false;
        }
        this.stick_costs = user.stick_costs + this.difficultiesToTime(this.formData.difficulties);
        return true;
      },
      submit() {
        uni.showLoading({ mask: true });
        this.$refs.form.validate().then((res) => {
			console.log(res)
			if(res.category && res.descrip && (res.difficulties || res.difficulties == 0 )&& res.title)
				return this.submitForm(res);
			else
				return false
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading();
        });
      },
      submitForm(value) {
        return db.collection(dbCollectionName).add(value).then((res) => {
          uni.showToast({ icon: 'none', title: '新增成功' });
          if (this.formData.is_stick) {
            db.collection('uni-id-users').where(`_id == "${this.current_user.uid}"`).update({
              stick_costs: this.stick_costs
            });
          }
          this.getOpenerEventChannel().emit('refreshData');
          setTimeout(() => uni.navigateBack(), 500);
        }).catch((err) => {
          uni.showModal({ content: err.message || '请求服务失败', showCancel: false });
        });
      },
      handleSwitchChange(event) {
        this.tryToStickQuestion().then((canStick) => {
          this.binddata('is_stick', canStick ? event.detail.value : false);
        });
      },
      difficultiesToTime(difficulties) {
        if (difficulties == 0) return 5;
        else if (difficulties == 1) return 10;
        else return 15;
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
