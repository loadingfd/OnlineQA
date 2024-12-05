// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "title": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "标题"
  },
  "descrip": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "详情"
  },
  "difficulties": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
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
        ]
      }
    ],
    "label": "难度"
  },
  "category": {
    "rules": [
      {
        "format": "string"
      },
      {
        "range": [
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
      }
    ],
    "label": "类型"
  },
  "images": {
    "rules": [
      {
        "format": "array"
      },
      {
        "arrayType": "file"
      },
      {
        "maxLength": 3
      }
    ],
    "title": "添加照片",
    "label": "添加照片"
  },
  "is_stick": {
    "rules": [
      {
        "format": "bool"
      }
    ],
    "label": "置顶"
  }
}

const enumConverter = {
  "difficulties_valuetotext": {
    "0": "简单",
    "1": "中等",
    "2": "困难"
  },
  "category_valuetotext": {
    "math": "数学题",
    "code": "编程题",
    "resource": "求资料",
    "other": "其他"
  }
}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
