"use strict";
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
};
exports.validator = validator;
