export async function printReport(reportElement: HTMLDivElement) {
  await document.fonts.ready;
  const printWindow = window.open('', '_blank', 'width=900,height=1200');

  if (!printWindow) {
    window.print();
    return;
  }

  const inlineStyles = Array.from(document.querySelectorAll('style'))
    .map((node) => node.outerHTML)
    .join('\n');
  const stylesheetLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  );
  const stylesheetContent = await Promise.all(
    stylesheetLinks.map(async (link) => {
      try {
        const response = await fetch(link.href);
        if (!response.ok) throw new Error(`Unable to load ${link.href}`);
        return `<style>${await response.text()}</style>`;
      } catch (error) {
        console.warn('Unable to inline print stylesheet', error);
        return link.outerHTML;
      }
    })
  );
  const printReady = new Promise<void>((resolve) => {
    printWindow.addEventListener('load', () => resolve(), { once: true });
  });

  printWindow.document.open();
  printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>TexInspect Report</title>
            <base href="${window.location.origin}/">
            ${inlineStyles}
            ${stylesheetContent.join('\n')}
            <style>
              html, body, #root {
                height: auto !important;
                overflow: visible !important;
                background: #ffffff !important;
              }

              body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              #report-content {
                width: 190mm !important;
                max-width: 190mm !important;
                min-height: auto !important;
                margin: 0 auto !important;
                background: #ffffff !important;
                box-shadow: none !important;
              }

              table {
                width: 100% !important;
                min-width: 0 !important;
                table-layout: fixed;
              }

              th, td {
                word-break: break-word;
              }

              tr,
              .avoid-page-break {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              @page {
                size: A4;
                margin: 10mm;
              }
            </style>
          </head>
          <body>
            ${reportElement.outerHTML}
          </body>
        </html>
      `);
  printWindow.document.close();

  await Promise.race([
    printReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
  ]);
  await printWindow.document.fonts?.ready;
  await Promise.all(
    Array.from(printWindow.document.images).map((image) => image.decode().catch(() => undefined))
  );

  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
