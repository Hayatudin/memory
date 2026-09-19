async function test(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    const html = await res.text();
    const match1 = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src|image)["'][^>]+content=["']([^"']+)["']/i);
    const match2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src|image)["']/i);
    const titleMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i) || html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]+content=["']([^"']+)["']/i);

    console.log(url, {
      title: titleMatch ? (titleMatch[1] || titleMatch[0]) : null,
      desc: descMatch ? descMatch[1] : null,
      image: match1 ? match1[1] : (match2 ? match2[1] : null)
    });
  } catch(e) {
    console.error(url, e.message);
  }
}

async function run() {
  await test('https://github.com');
  await test('https://openai.com');
  await test('https://chess.com');
  await test('https://youtube.com');
}
run();
