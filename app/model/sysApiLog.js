'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const SysApiLogSchema = new Schema({

    serverHost: {
      type: String,
      index: 1,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    parameter: {
      type: Object,
      default: null,
    },
    serverIp: {
      type: String,
      default: null,
      index: 1,
    },
    env: {
      type: String,
      default: null,
      index: 1,
    },
    method: {
      type: String,
      default: null,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('SysApiLog', SysApiLogSchema, 'SysApiLog');
};
