const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeGemini();
  }

  async initializeGemini() {
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        console.log('⚠️  Gemini API key not configured. Using mock captions.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  async generateCaption(imageBase64, context = {}) {
    try {
      // If Gemini is not initialized, return mock caption
      if (!this.model) {
        return this.generateMockCaption(context);
      }

      const { location, mood, timeOfDay } = context;
      
      const prompt = `Generate ONE perfect Gen Z style Instagram caption for this image. 
      
      Context:
      - Location: ${location || 'Unknown location'}
      - Mood: ${mood || 'General'}
      - Time: ${timeOfDay || 'Unknown time'}
      
      Requirements:
      - Generate ONLY ONE caption (not multiple options)
      - Use Gen Z slang and trendy language
      - Keep it under 100 characters
      - Include relevant emojis
      - Make it engaging and relatable
      - Use modern internet culture references
      - Be authentic and not overly promotional
      - Make it feel natural and spontaneous
      
      Examples of Gen Z style:
      - "no thoughts just vibes ✨"
      - "main character energy fr 💅"
      - "this hits different at 3am 🕐"
      - "pov: you're living your best life 📸"
      - "the serotonin this gives me >> 🧠"
      
      Generate ONE caption that matches this style:`;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const caption = response.text().trim();

      // Generate hashtags
      const hashtags = await this.generateHashtags(caption, context);

      return {
        caption: caption.replace(/['"]/g, ''), // Remove quotes
        hashtags: hashtags,
        generated: true
      };

    } catch (error) {
      console.error('Error generating caption with Gemini:', error);
      return this.generateMockCaption(context);
    }
  }

  async generateHashtags(caption, context) {
    try {
      if (!this.model) {
        return this.generateMockHashtags(context);
      }

      const prompt = `Based on this Instagram caption: "${caption}"
      
      Generate EXACTLY 4 relevant hashtags that are:
      - Popular on Instagram
      - Gen Z friendly
      - Related to the content
      - Mix of trending and niche tags
      
      Return only the 4 hashtags separated by spaces, no explanations, no extra text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const hashtagsText = response.text().trim();
      
      // Extract hashtags from response
      const hashtags = hashtagsText
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.replace('#', ''))
        .slice(0, 4); // Ensure exactly 4 hashtags

      return hashtags.length >= 4 ? hashtags : this.generateMockHashtags(context);

    } catch (error) {
      console.error('Error generating hashtags:', error);
      return this.generateMockHashtags(context);
    }
  }

  generateMockCaption(context) {
    const { location, mood, timeOfDay } = context;
    
    const genZCaptions = [
      "no thoughts just vibes ✨",
      "main character energy fr 💅",
      "this hits different at 3am 🕐",
      "pov: you're living your best life 📸",
      "the serotonin this gives me >> 🧠",
      "slaying so hard rn 💅✨",
      "this is my villain era 🖤",
      "bestie this is iconic 📸",
      "the way this makes me feel >> 😭",
      "living for this moment fr 💯",
      "this is giving main character 🎬",
      "the vibes are immaculate ✨",
      "this is so me coded 🧬",
      "the way I'm obsessed >> 😍",
      "this is my roman empire 🏛️"
    ];

    const locationBased = {
      'coffee': "coffee shop main character ☕",
      'beach': "beach day bestie 🏖️",
      'city': "city girl era 🏙️",
      'nature': "nature is healing 🌿",
      'home': "homebody vibes 🏠"
    };

    const timeBased = {
      'morning': "morning person era ☀️",
      'afternoon': "afternoon delight ✨",
      'evening': "golden hour hits different 🌅",
      'night': "night owl activities 🦉"
    };

    let caption = genZCaptions[Math.floor(Math.random() * genZCaptions.length)];
    
    if (location && locationBased[location.toLowerCase()]) {
      caption = locationBased[location.toLowerCase()];
    } else if (timeOfDay && timeBased[timeOfDay.toLowerCase()]) {
      caption = timeBased[timeOfDay.toLowerCase()];
    }
      
      return {
      caption,
      hashtags: this.generateMockHashtags(context),
      generated: false
    };
  }

  generateMockHashtags(context) {
    const { location, mood } = context;
    
    const baseHashtags = [
      "vibes", "aesthetic", "mood", "slay", "maincharacter",
      "genz", "relatable", "iconic", "obsessed", "bestie"
    ];

    const locationHashtags = {
      'coffee': ["coffee", "cafe", "coffeeshop"],
      'beach': ["beach", "ocean", "summer"],
      'city': ["city", "urban", "downtown"],
      'nature': ["nature", "outdoors", "hiking"],
      'home': ["home", "cozy", "comfort"]
    };

    const moodHashtags = {
      'happy': ["happy", "joy", "positive"],
      'chill': ["chill", "relaxed", "peaceful"],
      'energetic': ["energy", "hype", "excited"],
      'sad': ["moody", "melancholy", "feels"],
      'confident': ["confident", "bold", "fierce"]
    };

    let hashtags = [...baseHashtags];
    
    if (location && locationHashtags[location.toLowerCase()]) {
      hashtags = [...hashtags, ...locationHashtags[location.toLowerCase()]];
    }
    
    if (mood && moodHashtags[mood.toLowerCase()]) {
      hashtags = [...hashtags, ...moodHashtags[mood.toLowerCase()]];
    }

    // Shuffle and return exactly 4 hashtags
    const shuffled = hashtags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }

  async generateStoryCaption(storyImages, context = {}) {
    try {
      if (!this.model || storyImages.length === 0) {
        return this.generateMockStoryCaption(context);
      }

      const { location, mood, timeOfDay } = context;
      
      const prompt = `Generate a Gen Z style Instagram story caption for a series of ${storyImages.length} images. 
      
      Context:
      - Location: ${location || 'Unknown location'}
      - Mood: ${mood || 'General'}
      - Time: ${timeOfDay || 'Unknown time'}
      - Number of images: ${storyImages.length}
      
      Requirements:
      - Use Gen Z slang and trendy language
      - Keep it under 80 characters
      - Include relevant emojis
      - Make it engaging for a story
      - Reference that it's multiple images
      - Be authentic and relatable
      
      Examples:
      - "story time bestie 📖✨"
      - "the way this day went >> 📸"
      - "pov: you're in my story 📱"
      - "this day was everything 💯"
      
      Generate a story caption:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const caption = response.text().trim();

      return {
        caption: caption.replace(/['"]/g, ''),
        hashtags: this.generateMockHashtags(context),
        generated: true
      };

    } catch (error) {
      console.error('Error generating story caption:', error);
      return this.generateMockStoryCaption(context);
    }
  }

  generateMockStoryCaption(context) {
    const storyCaptions = [
      "story time bestie 📖✨",
      "the way this day went >> 📸",
      "pov: you're in my story 📱",
      "this day was everything 💯",
      "living my best life fr 📸",
      "the main character energy >> ✨",
      "this is my story era 📖",
      "bestie this is iconic 📸",
      "the way I'm slaying >> 💅",
      "story mode activated 📱"
    ];

    const caption = storyCaptions[Math.floor(Math.random() * storyCaptions.length)];
      
      return {
      caption,
      hashtags: this.generateMockHashtags(context),
      generated: false
    };
  }
}

module.exports = new GeminiService();