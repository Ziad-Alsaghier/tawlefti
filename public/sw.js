self.addEventListener('push', event => {
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.svg',
      badge: '/logo.svg'
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (e) {
    console.error('Error handling push event:', e);
    const options = {
      body: event.data.text(),
      icon: '/logo.svg',
      badge: '/logo.svg'
    };
    event.waitUntil(
      self.registration.showNotification('You have a new notification', options)
    );
  }
});