export function buildQrData(type, data) {
  if (!data) return ''

  switch (type) {
    case 'wifi': {
      const { ssid, password, security, hidden } = data
      if (!ssid) return ''
      const h = hidden ? 'true' : 'false'
      return `WIFI:T:${security || 'WPA'};S:${escape(ssid)};P:${escape(password || '')};H:${h};;`
    }
    case 'url':
      return data.url || ''
    case 'contact': {
      const { firstName, lastName, phone, email, org, url } = data
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName}`,
        `FN:${firstName} ${lastName}`,
        org   ? `ORG:${org}` : '',
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        url   ? `URL:${url}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n')
    }
    case 'email': {
      const { to, subject, body } = data
      if (!to) return ''
      const params = []
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
      if (body) params.push(`body=${encodeURIComponent(body)}`)
      return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`
    }
    case 'sms': {
      const { phone, message } = data
      if (!phone) return ''
      return `smsto:${phone}${message ? ':' + message : ''}`
    }
    case 'phone':
      return data.phone ? `tel:${data.phone}` : ''
    case 'location': {
      const { lat, lng, label } = data
      if (!lat || !lng) return ''
      return label
        ? `geo:${lat},${lng}?q=${encodeURIComponent(label)}`
        : `geo:${lat},${lng}`
    }
    case 'event': {
      const { title, start, end, location, description } = data
      if (!title || !start) return ''
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        `DTSTART:${start.replace(/[-:]/g, '').replace('T', 'T')}`,
        end ? `DTEND:${end.replace(/[-:]/g, '').replace('T', 'T')}` : '',
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
      ].filter(Boolean).join('\n')
    }
    case 'text':
      return data.text || ''
    case 'crypto': {
      const { coin, address, amount } = data
      if (!address) return ''
      return amount ? `${coin}:${address}?amount=${amount}` : `${coin}:${address}`
    }
    default:
      return ''
  }
}

function escape(str) {
  return (str || '').replace(/[\\;,:"]/g, c => '\\' + c)
}
