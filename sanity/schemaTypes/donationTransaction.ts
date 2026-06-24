// schemas/donationTransaction.ts
export default {
  name: 'donationTransaction',
  title: 'Donation Transaction (Pending Box)',
  type: 'document',
  fields: [
    {
      name: 'orderId',
      title: 'Order ID',
      type: 'string',
    },
    {
      name: 'donorName',
      title: 'Nama Donatur',
      type: 'string',
    },
    {
      name: 'donorPhone',
      title: 'Nomor WhatsApp',
      type: 'string',
    },
    {
      name: 'amount',
      title: 'Nominal Donasi',
      type: 'number',
    },
    // 🚀 1. TAMBAHAN FIELD KODE UNIK (3 DIGIT EKOR)
    {
      name: 'uniqueCode',
      title: 'Kode Unik',
      type: 'number',
    },
    // 🚀 2. TAMBAHAN FIELD TOTAL YANG WAJIB DI-TRANSFER USER
    {
      name: 'totalAmount',
      title: 'Total Pembayaran (+Kode Unik)',
      type: 'number',
    },
    {
      name: 'status',
      title: 'Status Pembayaran',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Success', value: 'success' },
          { title: 'Failed', value: 'failed' }
        ]
      }
    },
    {
      name: 'slug',
      title: 'Target Program Slug',
      type: 'string',
    }
  ]
}