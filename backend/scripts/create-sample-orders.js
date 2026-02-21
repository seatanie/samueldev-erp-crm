const mongoose = require('mongoose');
const Order = require('../src/models/coreModels/Order');
const Client = require('../src/models/appModels/Client');
const Product = require('../src/models/coreModels/Product');
const Invoice = require('../src/models/appModels/Invoice');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/samueldev-erp-crm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleOrders() {
  try {
    console.log('🔄 Creando pedidos de muestra...');

    // Buscar clientes existentes
    const clients = await Client.find().limit(3);
    if (clients.length === 0) {
      console.log('❌ No hay clientes en la base de datos. Creando cliente de muestra...');
      const sampleClient = new Client({
        name: 'Cliente de Prueba',
        company: 'Empresa Demo',
        email: 'cliente@demo.com',
        phone: '123-456-7890',
        address: 'Dirección de prueba',
        city: 'Ciudad Demo',
        state: 'Estado Demo',
        country: 'Colombia'
      });
      await sampleClient.save();
      clients.push(sampleClient);
    }

    // Buscar productos existentes
    const products = await Product.find().limit(3);
    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos. Creando productos de muestra...');
      const sampleProducts = [
        {
          name: 'Producto 1',
          sku: 'PROD-001',
          price: 100,
          cost: 50,
          description: 'Producto de prueba 1'
        },
        {
          name: 'Producto 2', 
          sku: 'PROD-002',
          price: 200,
          cost: 100,
          description: 'Producto de prueba 2'
        },
        {
          name: 'Producto 3',
          sku: 'PROD-003', 
          price: 150,
          cost: 75,
          description: 'Producto de prueba 3'
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
        products.push(product);
      }
    }

    // Crear factura de muestra
    const sampleInvoice = new Invoice({
      invoiceNumber: 'INV-001',
      client: clients[0]._id,
      items: [
        {
          product: products[0]._id,
          quantity: 2,
          price: products[0].price
        }
      ],
      subtotal: products[0].price * 2,
      total: products[0].price * 2,
      status: 'pending'
    });
    await sampleInvoice.save();

    // Crear pedidos de muestra
    const sampleOrders = [
      {
        orderNumber: 'ORD-001',
        invoice: sampleInvoice._id,
        customer: clients[0]._id,
        products: [
          {
            product: products[0]._id,
            quantity: 2,
            unitPrice: products[0].price,
            sku: products[0].sku
          }
        ],
        status: 'pending',
        phone: '123-456-7890',
        state: 'Estado Demo',
        city: 'Ciudad Demo',
        notes: 'Pedido de prueba 1'
      },
      {
        orderNumber: 'ORD-002',
        invoice: sampleInvoice._id,
        customer: clients[0]._id,
        products: [
          {
            product: products[1]._id,
            quantity: 1,
            unitPrice: products[1].price,
            sku: products[1].sku
          }
        ],
        status: 'confirmed',
        phone: '123-456-7890',
        state: 'Estado Demo',
        city: 'Ciudad Demo',
        notes: 'Pedido de prueba 2'
      },
      {
        orderNumber: 'ORD-003',
        invoice: sampleInvoice._id,
        customer: clients[0]._id,
        products: [
          {
            product: products[2]._id,
            quantity: 3,
            unitPrice: products[2].price,
            sku: products[2].sku
          }
        ],
        status: 'delivered',
        phone: '123-456-7890',
        state: 'Estado Demo',
        city: 'Ciudad Demo',
        notes: 'Pedido de prueba 3'
      }
    ];

    // Limpiar pedidos existentes
    await Order.deleteMany({});

    // Crear los pedidos
    for (const orderData of sampleOrders) {
      const order = new Order(orderData);
      await order.save();
      console.log(`✅ Pedido creado: ${order.orderNumber}`);
    }

    console.log('🎉 Pedidos de muestra creados exitosamente!');
    console.log(`📊 Total de pedidos: ${sampleOrders.length}`);

  } catch (error) {
    console.error('❌ Error creando pedidos de muestra:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleOrders();




