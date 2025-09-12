// Database Seeding Script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Message = require('./src/models/Message');
const Conversation = require('./src/models/Conversation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB for seeding');
    seedDatabase();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});

    // Create users
    const users = await User.create([
      {
        username: 'mike_rodriguez',
        email: 'mike@example.com',
        password: 'password123',
        displayName: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'NYC based photographer and fitness enthusiast',
        location: '40.7128,-74.0060',
        isOnline: true,
        lastSeen: new Date(),
        streak: 15
      },
      {
        username: 'sarah_j',
        email: 'sarah@example.com',
        password: 'password123',
        displayName: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'London explorer and coffee lover',
        location: '51.5074,-0.1278',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        streak: 8
      },
      {
        username: 'lisa_dubois',
        email: 'lisa@example.com',
        password: 'password123',
        displayName: 'Lisa Dubois',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Parisian artist and culture enthusiast',
        location: '48.8566,2.3522',
        isOnline: true,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        streak: 23
      },
      {
        username: 'alex_chen',
        email: 'alex@example.com',
        password: 'password123',
        displayName: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Mumbai tech entrepreneur',
        location: '19.0760,72.8777',
        isOnline: true,
        lastSeen: new Date(Date.now() - 20 * 60 * 1000),
        streak: 12
      },
      {
        username: 'emma_tanaka',
        email: 'emma@example.com',
        password: 'password123',
        displayName: 'Emma Tanaka',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        bio: 'Tokyo fashion designer',
        location: '35.6762,139.6503',
        isOnline: false,
        lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
        streak: 5
      },
      {
        username: 'david_kim',
        email: 'david@example.com',
        password: 'password123',
        displayName: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        bio: 'Sydney musician and surfer',
        location: '-33.8688,151.2093',
        isOnline: true,
        lastSeen: new Date(Date.now() - 15 * 60 * 1000),
        streak: 18
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create posts for each user
    const posts = [];
    for (const user of users) {
      const userPosts = await Post.create([
        {
          author: user._id,
          image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
          caption: `Amazing day in ${user.displayName.split(' ')[0]}'s city! 🌟 #${user.username} #travel`,
          hashtags: [user.username, 'travel', 'life'],
          location: {
            name: user.bio.split(' ')[0] + ' City',
            coordinates: {
              type: 'Point',
              coordinates: [parseFloat(user.location.split(',')[1]), parseFloat(user.location.split(',')[0])]
            }
          },
          likes: [],
          comments: [],
          views: Math.floor(Math.random() * 1000),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        },
        {
          author: user._id,
          image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
          caption: `Beautiful sunset from my window! 🌅 #sunset #${user.username}`,
          hashtags: [user.username, 'sunset', 'beautiful'],
          location: {
            name: user.bio.split(' ')[0] + ' Sunset Point',
            coordinates: {
              type: 'Point',
              coordinates: [
                parseFloat(user.location.split(',')[1]) + (Math.random() - 0.5) * 0.1,
                parseFloat(user.location.split(',')[0]) + (Math.random() - 0.5) * 0.1
              ]
            }
          },
          likes: [],
          comments: [],
          views: Math.floor(Math.random() * 800),
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
        }
      ]);
      posts.push(...userPosts);
    }

    console.log(`✅ Created ${posts.length} posts`);

    // Create some conversations and messages
    const conversations = [];
    const messages = [];

    // Create conversation between first two users
    const conversation1 = await Conversation.create({
      participants: [users[0]._id, users[1]._id],
      lastMessage: null,
      lastMessageAt: new Date()
    });
    conversations.push(conversation1);

    // Create messages for conversation 1
    const conv1Messages = await Message.create([
      {
        sender: users[0]._id,
        receiver: users[1]._id,
        content: 'Hey Sarah! How are you doing?',
        type: 'text',
        conversation: conversation1._id,
        isRead: true,
        readAt: new Date(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        sender: users[1]._id,
        receiver: users[0]._id,
        content: 'Hi Mike! I\'m doing great, thanks for asking! How about you?',
        type: 'text',
        conversation: conversation1._id,
        isRead: true,
        readAt: new Date(),
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        sender: users[0]._id,
        receiver: users[1]._id,
        content: 'Pretty good! Just finished a morning run in Central Park',
        type: 'text',
        conversation: conversation1._id,
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]);
    messages.push(...conv1Messages);

    // Update conversation with last message
    conversation1.lastMessage = conv1Messages[conv1Messages.length - 1]._id;
    await conversation1.save();

    // Create another conversation
    const conversation2 = await Conversation.create({
      participants: [users[2]._id, users[3]._id],
      lastMessage: null,
      lastMessageAt: new Date()
    });
    conversations.push(conversation2);

    const conv2Messages = await Message.create([
      {
        sender: users[2]._id,
        receiver: users[3]._id,
        content: 'Bonjour Alex! Comment ça va?',
        type: 'text',
        conversation: conversation2._id,
        isRead: true,
        readAt: new Date(),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        sender: users[3]._id,
        receiver: users[2]._id,
        content: 'Salut Lisa! Ça va bien, merci! How is Paris treating you?',
        type: 'text',
        conversation: conversation2._id,
        isRead: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      }
    ]);
    messages.push(...conv2Messages);

    // Update conversation with last message
    conversation2.lastMessage = conv2Messages[conv2Messages.length - 1]._id;
    await conversation2.save();

    console.log(`✅ Created ${conversations.length} conversations`);
    console.log(`✅ Created ${messages.length} messages`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Conversations: ${conversations.length}`);
    console.log(`   - Messages: ${messages.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}
