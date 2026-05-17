export default {
  id: 'googleReCaptcha',
  title: 'Avoid using Google reCAPTCHA',
  description:
    'You should avoid using Google reCAPTCHA since it will share your users information with Google.',
  weight: 9,
  severity: 'warn',
  tags: ['privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';

    for (const asset of page.assets) {
      // Avoid catching redirects from http to https
      if (
        asset.url.includes('www.google.com/recaptcha/enterprise.js') ||
        asset.url.includes('www.google.com/recaptcha/api.js')
      ) {
        score = 0;
        offending.push(asset.url);
      }
    }

    if (score === 0) {
      advice =
        'You share your user data with Google since you use Google reCAPTCHA.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
