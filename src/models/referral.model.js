const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const referralSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    YOE: {
      type: String,
      required: true,
      trim: true,
    },
    jobId: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    appliedUsers: {
      type: [
        {
          _id: false,
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
          },
          state: {
            type: 'String',
            default: 'Pending',
          },
          resume: {
            data: Buffer,
            contentType: String,
          },
        },
      ],
    },

    createdUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    // resume: {
    //   data: Buffer,
    //   contentType: String,
    // },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
referralSchema.plugin(toJSON);
referralSchema.plugin(paginate);

/**
 * @typedef Referral
 */
const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
