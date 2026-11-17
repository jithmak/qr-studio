'use strict';

const $ = (id) => document.getElementById(id);
let current = null;
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

function clearResult() {
  current = null;
  $('png').disabled = $('svg').disabled = true;
  $('result').hidden = true;
  $('placeholder').hidden = false;
}

$('link').addEventListener('input', () => {
  clearResult();
  $('error').hidden = true;
  $('link').removeAttribute('aria-invalid');
  $('status').textContent = 'Ready when you are.';
});

$('generator').addEventListener('submit', (event) => {
  event.preventDefault();
  clearResult();
  $('error').hidden = true;
  $('link').removeAttribute('aria-invalid');
  const value = $('link').value.trim();
  try {
    if (!value) throw new Error('Paste a link to generate your QR code.');
    if (/\s/.test(value)) throw new Error('Your link contains spaces or line breaks. Paste the full link without them.');
    let url;
    try { url = new URL(value); } catch { throw new Error('Enter a full link, such as https://example.com, mailto:name@example.com or tel:+94112345678.'); }
    if (['javascript:', 'data:', 'vbscript:'].includes(url.protocol)) throw new Error('Use a website, email, phone or app link, rather than executable content.');
    if (new TextEncoder().encode(value).length > 2331) throw new Error('This link is too long for a QR code. Use a shorter direct link (up to 2,331 UTF-8 bytes).');
    const code = qrcode(0, 'M');
    code.addData(value, 'Byte');
    try { code.make(); } catch { throw new Error('This link is too long for a QR code. Try a shorter link.'); }
    const modules = code.getModuleCount();
    const size = modules + 8; // Four white modules on each edge keep scans reliable.
    const scale = Math.ceil(4096 / size);
    const canvas = $('qr');
    canvas.width = canvas.height = size * scale;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    const paths = [];
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (!code.isDark(row, col)) continue;
        context.fillRect((col + 4) * scale, (row + 4) * scale, scale, scale);
        paths.push(`M${col + 4},${row + 4}h1v1h-1z`);
      }
    }
    current = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${canvas.width}" height="${canvas.height}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path d="${paths.join('')}" fill="black"/></svg>`;
    $('destination').textContent = value;
    $('placeholder').hidden = true;
    $('result').hidden = false;
    $('png').disabled = $('svg').disabled = false;
    $('status').textContent = 'Your QR is ready. Download it to keep it.';
  } catch (error) {
    $('error').textContent = error.message;
    $('error').hidden = false;
    $('link').setAttribute('aria-invalid', 'true');
    $('status').textContent = 'Check your link and try again.';
  }
});

function download(blob, extension) {
  if (!blob) { $('status').textContent = 'Could not create the download. Please try again.'; return; }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `qr-code.${extension}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

$('png').addEventListener('click', () => {
  if (current) $('qr').toBlob((blob) => download(blob, 'png'), 'image/png');
});
$('svg').addEventListener('click', () => {
  if (current) download(new Blob([current], { type: 'image/svg+xml' }), 'svg');
});
