const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: true }))

admin.initializeApp()
const database = admin.firestore()

app.post('/register', async (req, res) => {
  const { prefix, name, lastname, email, type, studentYear } = req.body

  try {
    const newRegistrantRef = await database.collection('registrant').add({
      prefix,
      name,
      lastname,
      email,
      type,
      studentYear,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isCheckedIn: false
    })
    res.status(200).send(newRegistrantRef.id)
  } catch (err) {
    res.status(500).send('Internal Server Error!')
    console.error(err)
  }
})

exports.registration = functions
  .region('asia-northeast1')
  .runWith({ memory: '1GB' })
  .https.onRequest(app)

const json2csv = require('json2csv').parse

exports.csvJsonReport = functions
  .region('asia-northeast1')
  .runWith({ memory: '1GB' })
  .https.onRequest((request, response) => {
    const db = admin.firestore()
    const registrantRef = db.collection('registrant')
    return registrantRef
      .get()
      .then(querySnapshot => {
        const orders = []

        querySnapshot.forEach(doc => {
          const order = doc.data()
          orders.push(order)
        })
        const csv = json2csv(orders)
        response.setHeader(
          'Content-disposition',
          'attachment; filename=report.csv'
        )
        response.set('Content-Type', 'text/csv')
        response.status(200).send(csv)
      })
      .catch(err => {
        console.log(err)
      })
  })
