# AI Chatbot Implementation Guide (Zero Budget)

## Overview

This guide outlines how to implement a free AI chatbot using Google's Dialogflow for your print-on-demand business. This solution provides basic customer support automation without any upfront costs.

## Step 1: Set Up Dialogflow Account

1. **Create a Google Cloud Account**

   - Go to [cloud.google.com](https://cloud.google.com/) and sign up for a free account
   - No credit card is required for the free tier

2. **Enable Dialogflow API**

   - In the Google Cloud Console, navigate to "APIs & Services"
   - Search for "Dialogflow API" and enable it
   - The free tier includes:
     - Up to 1,000 text requests per month
     - Basic natural language understanding

3. **Create a New Agent**

   - Go to [dialogflow.cloud.google.com](https://dialogflow.cloud.google.com/)
   - Click "Create Agent"
   - Name it "PrintOnDemandSupport"
   - Select your Google Cloud project
   - Choose your preferred language (English recommended to start)

## Step 2: Define Intents

Intents are the different types of customer queries your chatbot will handle. Start with these essential intents:

### 1. Welcome Intent

- **Training phrases**: 
  - "Hello"
  - "Hi"
  - "Start"
  - "Help"
- **Responses**:
  - "Welcome to our Print-on-Demand support! I can help with order status, product information, and customization questions. What can I assist you with today?"

### 2. Order Status Intent

- **Training phrases**:
  - "Where is my order?"
  - "Track my order"
  - "Order status"
  - "When will my order arrive?"
- **Parameters**:
  - Order Number (entity type: @sys.number)
- **Responses**:
  - Without order number: "I'd be happy to help you track your order. Could you please provide your order number?"
  - With order number: "Thanks for providing your order number. To check your order status, please visit our tracking page at [your-website.com/track] and enter your order number."

### 3. Product Information Intent

- **Training phrases**:
  - "Tell me about your t-shirts"
  - "What products do you offer?"
  - "Do you sell mugs?"
  - "Product information"
- **Parameters**:
  - Product Type (entity type: custom @ProductType)
- **Responses**:
  - General: "We offer a variety of customizable products including t-shirts, hoodies, mugs, phone cases, and posters. Which product are you interested in?"
  - Specific product: "Our [product type] are high-quality and fully customizable. You can upload your own designs or use our design tools to create something unique."

### 4. Pricing Intent

- **Training phrases**:
  - "How much do t-shirts cost?"
  - "Pricing"
  - "What are your prices?"
- **Parameters**:
  - Product Type (entity type: custom @ProductType)
- **Responses**:
  - General: "Our prices vary depending on the product and customization options. T-shirts start at $19.99, mugs at $12.99, and posters at $14.99."
  - Specific product: "Our [product type] start at $[price]. The final price depends on the customization options you choose."

### 5. Fallback Intent

- **Default Fallback Intent**: Automatically triggered when no other intent matches
- **Responses**:
  - "I'm sorry, I didn't understand that. Could you rephrase your question? I can help with order status, product information, and pricing."
  - "I'm still learning! Could you try asking in a different way? Or you can contact our human support team at support@yourcompany.com."

## Step 3: Create Custom Entities

Entities are categories of information your chatbot can recognize:

### 1. ProductType Entity

- **Entity values**:
  - T-shirt (synonyms: tee, shirt, tshirt)
  - Hoodie (synonyms: sweatshirt, hooded sweatshirt)
  - Mug (synonyms: cup, coffee mug)
  - Poster (synonyms: print, wall art)
  - Phone case (synonyms: mobile cover, phone cover)

## Step 4: Test Your Chatbot

1. Use the built-in testing console in Dialogflow
2. Try various customer queries to ensure your intents are recognized correctly
3. Refine your training phrases and responses based on testing results

## Step 5: Integrate with Your Website

### Option 1: Dialogflow Messenger (Easiest)

1. In Dialogflow console, go to "Integrations"
2. Enable "Dialogflow Messenger"
3. Copy the provided HTML snippet
4. Paste it into your website's HTML just before the closing `</body>` tag:

```html
<script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
<df-messenger
  intent="WELCOME"
  chat-title="Print-on-Demand Support"
  agent-id="YOUR_AGENT_ID"
  language-code="en"
></df-messenger>
<style>
  df-messenger {
    z-index: 999;
    position: fixed;
    bottom: 16px;
    right: 16px;
  }
</style>
```

### Option 2: Custom Integration with REST API

For more control over the chatbot appearance, you can use the Dialogflow REST API:

1. Create a simple chat interface in HTML/CSS:

```html
<!-- Add this to your website -->
<div class="pod-chatbot-container">
  <button class="pod-chatbot-toggle">Chat with us</button>
  <div class="pod-chatbot-window" style="display: none;">
    <div class="pod-chatbot-header">
      <h3>Print-on-Demand Support</h3>
      <button class="pod-chatbot-close">×</button>
    </div>
    <div class="pod-chatbot-messages"></div>
    <div class="pod-chatbot-input">
      <input type="text" placeholder="Type your question...">
      <button>Send</button>
    </div>
  </div>
</div>
```

2. Add JavaScript to handle the interaction (this requires setting up a simple backend proxy to protect your API credentials)

## Step 6: Monitor and Improve

1. Regularly check the Dialogflow console to review conversations
2. Look for patterns in user queries that aren't being handled well
3. Add new training phrases to improve intent recognition
4. Update responses based on common customer needs

## Step 7: Future Upgrades (When Budget Allows)

When your business starts generating revenue, consider these upgrades:

1. **Upgrade to Dialogflow CX**: More advanced conversation flows and better context handling
2. **Integrate with Customer Database**: Allow the chatbot to look up real order information
3. **Add Voice Capabilities**: Enable voice interactions for accessibility
4. **Implement ChatGPT API**: For more sophisticated natural language understanding

## Resources

- **Dialogflow Documentation**: [https://cloud.google.com/dialogflow/docs](https://cloud.google.com/dialogflow/docs)
- **Google Cloud Free Tier**: [https://cloud.google.com/free](https://cloud.google.com/free)
- **Sample Chatbot Templates**: [https://cloud.google.com/dialogflow/es/docs/tutorials](https://cloud.google.com/dialogflow/es/docs/tutorials)
