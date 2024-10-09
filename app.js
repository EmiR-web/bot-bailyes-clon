const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/***
* Simular peticion async http 1.5 segundos
*/
const fakeHTTPMenu = async () => {
  console.log('⚡ Server request!')
  await delay(1500)
  console.log('⚡ Server return!')
  return Promise.resolve([{ body: 'Arepas' }, { body: 'Empanadas' }])
}

/***
* Simular peticion async http 0.5 segundos
*/
const fakeHTTPPayment = async () => {
  const link = `https://www.buymeacoffee.com/leifermendez?t=${Date.now()}`
  console.log('⚡ Server request!')
  await delay(500)
  console.log('⚡ Server return!')
  return Promise.resolve([
      { body: `Puedes hacer un *pago* en el siguiente link: ${link}` },
  ])
}

const flujoCash = addKeyword('efectivo').addAnswer(
  'Ok te espero con los billetes'
)
const flujosOnline = addKeyword('online').addAnswer(
  ['Te envio el link'],
  null,
  async (_, { flowDynamic }) => {
      const link = await fakeHTTPPayment()
      return flowDynamic(link)
  }
)

const flujoPedido = addKeyword(['pedido', 'pedir']).addAnswer(
  '¿Como quieres pagar en *efectivo* o *online*?',
  null,
  null,
  [flujoCash, flujosOnline]
)

const flowPrincipal = addKeyword('quiero más información')
.addAnswer(
    [
        '👋 Hola, bienvenido a *Surair Climatización* 😊', 
        '📍 Nos encontramos en *Pedro Pico 276*, Bahía Blanca',
],
)
.addAnswer( '🙋‍♀️ Mi Nombre es Milva, soy asesora comercial de la empresa')
.addAnswer('Te comparto las opciones de pago que tenemos disponibles actualmente',
    {
        media: ['https://iili.io/dyrrs7j.jpg' , 'https://iili.io/dyr6EPt.jpg']
    }
)
.addAnswer('¿Estás buscando algún equipo en particular?')

const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([flowPrincipal])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
  })

  QRPortalWeb()
}

main()
