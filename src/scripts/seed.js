require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Option pour nettoyer la base de données
    // Vérifier l'argument de ligne de commande ou la variable d'environnement
    const CLEAR_DB = process.argv.includes('--clear') || process.env.CLEAR_DB === 'true';
    
    if (CLEAR_DB) {
      console.log('\n🗑️  Clearing existing data...');
      await Message.deleteMany({});
      await Ticket.deleteMany({});
      await User.deleteMany({});
      console.log('✅ Database cleared\n');
    }

    // Créer des utilisateurs
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        email: 'admin@delivecrous.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'support@delivecrous.com',
        password: 'support123',
        role: 'support'
      },
      {
        email: 'john.doe@example.com',
        password: 'user123',
        role: 'user'
      },
      {
        email: 'jane.smith@example.com',
        password: 'user123',
        role: 'user'
      },
      {
        email: 'bob.martin@example.com',
        password: 'user123',
        role: 'user'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    const [admin, support, user1, user2, user3] = users;

    // Créer des tickets
    console.log('\n🎫 Creating tickets...');
    const tickets = await Ticket.create([
      {
        title: 'Problème de connexion à mon compte',
        description: 'Je n\'arrive pas à me connecter à mon compte depuis hier. J\'ai réinitialisé mon mot de passe mais ça ne fonctionne toujours pas.',
        status: 'open',
        priority: 'high',
        createdBy: user1._id,
        tags: ['connexion', 'urgent', 'compte']
      },
      {
        title: 'Commande non reçue',
        description: 'J\'ai passé une commande il y a 3 jours mais je ne l\'ai toujours pas reçue. Le statut indique "en livraison" depuis 2 jours.',
        status: 'in-progress',
        priority: 'urgent',
        createdBy: user2._id,
        assignedTo: support._id,
        tags: ['commande', 'livraison', 'retard']
      },
      {
        title: 'Question sur les horaires de livraison',
        description: 'Quels sont les horaires de livraison disponibles dans ma zone ?',
        status: 'closed',
        priority: 'low',
        createdBy: user3._id,
        assignedTo: support._id,
        tags: ['information', 'horaires']
      },
      {
        title: 'Erreur lors du paiement',
        description: 'J\'essaie de payer ma commande mais j\'obtiens une erreur "Transaction échouée". Mon compte bancaire a bien les fonds nécessaires.',
        status: 'open',
        priority: 'high',
        createdBy: user1._id,
        tags: ['paiement', 'erreur', 'transaction']
      },
      {
        title: 'Demande de remboursement',
        description: 'Ma commande est arrivée endommagée. Je souhaite être remboursé.',
        status: 'in-progress',
        priority: 'medium',
        createdBy: user2._id,
        assignedTo: support._id,
        tags: ['remboursement', 'dommage']
      },
      {
        title: 'Problème avec l\'application mobile',
        description: 'L\'application se ferme systématiquement quand j\'essaie de consulter mes commandes passées.',
        status: 'open',
        priority: 'medium',
        createdBy: user3._id,
        tags: ['application', 'bug', 'mobile']
      },
      {
        title: 'Modification d\'adresse de livraison',
        description: 'Je dois changer mon adresse de livraison pour ma prochaine commande.',
        status: 'closed',
        priority: 'low',
        createdBy: user1._id,
        assignedTo: support._id,
        tags: ['adresse', 'modification']
      },
      {
        title: 'Question sur les promotions',
        description: 'Y a-t-il des promotions en cours cette semaine ?',
        status: 'closed',
        priority: 'low',
        createdBy: user2._id,
        tags: ['promotion', 'information']
      }
    ]);
    console.log(`✅ Created ${tickets.length} tickets`);

    // Créer des messages
    console.log('\n💬 Creating messages...');
    const messages = await Message.create([
      // Messages pour le ticket "Problème de connexion"
      {
        content: 'Bonjour, j\'ai le même problème. Pouvez-vous m\'aider ?',
        ticketId: tickets[0]._id,
        authorId: user2._id
      },
      {
        content: 'Nous avons identifié le problème. Veuillez réessayer de vous connecter maintenant.',
        ticketId: tickets[0]._id,
        authorId: support._id
      },
      // Messages pour le ticket "Commande non reçue"
      {
        content: 'Bonjour, je vais vérifier l\'état de votre commande avec le service de livraison.',
        ticketId: tickets[1]._id,
        authorId: support._id
      },
      {
        content: 'Merci pour votre suivi. J\'attends votre retour.',
        ticketId: tickets[1]._id,
        authorId: user2._id
      },
      {
        content: 'Votre commande devrait arriver aujourd\'hui. Le livreur a été contacté.',
        ticketId: tickets[1]._id,
        authorId: support._id
      },
      // Messages pour le ticket "Question sur les horaires"
      {
        content: 'Les horaires de livraison sont du lundi au samedi de 10h à 20h.',
        ticketId: tickets[2]._id,
        authorId: support._id
      },
      {
        content: 'Parfait, merci pour l\'information !',
        ticketId: tickets[2]._id,
        authorId: user3._id
      },
      // Messages pour le ticket "Erreur lors du paiement"
      {
        content: 'Pouvez-vous me donner plus de détails sur l\'erreur exacte que vous voyez ?',
        ticketId: tickets[3]._id,
        authorId: support._id
      },
      // Messages pour le ticket "Demande de remboursement"
      {
        content: 'Nous sommes désolés pour ce désagrément. Pouvez-vous nous envoyer une photo du colis endommagé ?',
        ticketId: tickets[4]._id,
        authorId: support._id
      },
      {
        content: 'Voici la photo du colis endommagé.',
        ticketId: tickets[4]._id,
        authorId: user2._id
      },
      // Messages pour le ticket "Problème avec l'application mobile"
      {
        content: 'Quelle version de l\'application utilisez-vous ? Et sur quel appareil ?',
        ticketId: tickets[5]._id,
        authorId: support._id
      },
      // Messages pour le ticket "Modification d'adresse"
      {
        content: 'Votre adresse a été mise à jour avec succès.',
        ticketId: tickets[6]._id,
        authorId: support._id
      },
      {
        content: 'Merci beaucoup !',
        ticketId: tickets[6]._id,
        authorId: user1._id
      }
    ]);
    console.log(`✅ Created ${messages.length} messages`);

    // Résumé
    console.log('\n📊 Seed Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Users:        ${users.length}`);
    console.log(`   - Admin:      ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   - Support:    ${users.filter(u => u.role === 'support').length}`);
    console.log(`   - Users:      ${users.filter(u => u.role === 'user').length}`);
    console.log(`🎫 Tickets:      ${tickets.length}`);
    console.log(`   - Open:       ${tickets.filter(t => t.status === 'open').length}`);
    console.log(`   - In Progress: ${tickets.filter(t => t.status === 'in-progress').length}`);
    console.log(`   - Closed:     ${tickets.filter(t => t.status === 'closed').length}`);
    console.log(`💬 Messages:     ${messages.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔑 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@delivecrous.com / admin123');
    console.log('Support: support@delivecrous.com / support123');
    console.log('User 1:  john.doe@example.com / user123');
    console.log('User 2:  jane.smith@example.com / user123');
    console.log('User 3:  bob.martin@example.com / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Exécuter le seed
seedDatabase();

