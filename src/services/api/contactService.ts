export interface ContactInquiry { name: string; email: string; company: string; improvement: string; website: string; }

export async function submitContactInquiry({ name, email, company, improvement, website }: ContactInquiry) {
  const apiResponse = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      company,
      improvement,
      website,
    }),
  });

  const apiResult = await apiResponse.json().catch(() => null);
  if (!apiResponse.ok || apiResult?.success !== true) {
    throw new Error('Walkthrough request was rejected.');
  }

}
