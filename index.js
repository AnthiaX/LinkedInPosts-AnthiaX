require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🎉 Health check
app.get('/', (req, res) => res.send('🎉 LinkedIn bot is running'));

// 🚀 Power Automate POST endpoint
app.post('/post', async (req, res) => {
  const { message } = req.body;

  // Load secrets from environment (like Twitter bot)
  const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
  const ORG_URN = process.env.LINKEDIN_ORG_URN;

  if (!ACCESS_TOKEN || !ORG_URN) {
    return res.status(400).json({ error: 'Missing ACCESS_TOKEN or ORG_URN in environment' });
  }

  try {
    await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: ORG_URN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: message },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    res.json({ status: 'success', message: 'Post sent to LinkedIn' });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post to LinkedIn' });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
