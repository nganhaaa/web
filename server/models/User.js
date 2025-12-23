const userSchema = new mongoose.Schema({
  // ...existing code...
  savedVouchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher'
  }],
  // ...existing code...
});
