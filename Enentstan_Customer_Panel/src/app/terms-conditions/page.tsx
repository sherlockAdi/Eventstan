"use client";

const SECTIONS: { heading: string; body?: string; list?: string[] }[] = [
  {
    heading: "Article 1: General",
    body: `This agreement constitutes a legally binding agreement between company and the client. The website and application are owned by EventStan FZCO with all requisite rights and license to authorize Company to engage with the Client as set out in the agreement. You acknowledge that the Company platform serves as a venue for the online distribution and publication of information submitted and exchanged between client and the professionals, reservation for professional services, and by using, visiting, registering for, and/or otherwise using the website or application — including hiring any professional or rendering any services presented, promoted, and displayed on the company platform — by clicking on "I have read and agree to the terms and conditions".`,
  },
  {
    heading: "Acknowledgement",
    body: `You hereby certify that (1) you are a client, (2) you have the authority to enter into this agreement, (3) upon confirmation of a booking by you, you authorize the transfer of payment for professional services requested from a vendor on the application or company, and (4) you agree to be bound by all terms and conditions of this agreement and any other documents incorporated by reference. (5) You confirm that you are at least 18 years of age or the age of majority in the relevant jurisdiction, whichever is greater, and are fully able and competent to enter and comply with this agreement.`,
  },
  {
    heading: "Article 2: General Terms",
    body: `Company enables clients to render services on the company application and website. While company as a marketplace helps facilitate transactions carried out on the company application and/or website, the client acknowledges that company is a technology service provider and is not itself providing the professional services. The professional services are provided by third parties who are independent contractors and are not employed by company. The client agrees that, in accepting this agreement, it does so to connect with different professionals for availing professional services related to events on the company platform.`,
  },
  {
    heading: "Registration of Account",
    body: `Client must create an account in order to use some of the features offered by company. Use of any personal information the client provides during the account creation process is governed by our Privacy Policy. Client must keep the password confidential and is solely responsible for maintaining the confidentiality and security of their account, all changes and updates submitted through the account, and all activities that occur in connection with it.

Client may also register using credentials from third-party social networking sites (e.g. Facebook, Google). In this case, the client confirms they are the owner of any such social media account and authorizes company to collect authentication information and other details consistent with their applicable settings and instructions.

In creating an account, the client warrants that all information provided to company is true, accurate, and correct, and agrees to update it as necessary to keep it accurate. Client shall be responsible for all activities that occur on their account and agrees not to allow any third party to use their account for any purpose.

By creating an account, the client agrees to receive certain communications in connection with company's platform or services, and may opt-out or manage preferences for non-essential communications through account settings.`,
  },
  {
    heading: "Reservation of Services",
    body: `Client shall be solely responsible for the services they choose and book via the company application or website, on the basis of availability, pricing, reviews, and ratings. By booking professional(s) via the company website or application, the client agrees to working with these professionals.`,
  },
  {
    heading: "Client Representations",
    list: [
      "The client undertakes to conduct itself in accordance with all applicable laws and in a respectful manner, allowing professionals a safe and conducive environment to provide services.",
      "The client agrees they are solely responsible for their own safety and security and that of the professionals.",
      "The client ensures they will not undertake or assist in any unlawful or illegal activity.",
      "The client has full right and power to enter into and act according to the terms of this agreement, without violating any obligation to company or a third party.",
      "The client agrees that use of the company platform is solely at the client's own risk.",
      "The client warrants that payment for services rendered through the company website or application will be uninterrupted and timely.",
      "The client may have the right to provide a rating and feedback of a professional on the platform, which must at all times comply with applicable laws.",
    ],
  },
  {
    heading: "Company's Liability",
    list: [
      "Company shall be liable to rectify any technical issues related to the website and application promptly.",
      "Company will provide the client with access to their registered account to reserve services, visit, and provide rating and feedback.",
      "Company is obliged to issue a payment summary to the client for the fee paid.",
    ],
  },
  {
    heading: "Content Removal",
    body: `Company reserves the right, in its sole discretion and at any time without prior notice, to remove, block, or disable access to any content it considers objectionable, in violation of these terms, or otherwise harmful to the services or professionals. Company is not obligated to return any removed content under any circumstances.`,
  },
  {
    heading: "Return and Refund",
    body: `In certain cases and within certain limits, a payment shall be refunded to the client within fourteen (14) working days if the client is responsible for cancellation of the booking. Where a professional cancels the booking on reasonable grounds, company shall refund the payment to the client within ten (10) working days.`,
  },
  {
    heading: "Confidentiality",
    body: `This clause governs all disclosures of confidential information between the parties, including identification information, client and personal information, transactional, sales, and activity information, and client profile information (collectively, "Client Information"). Company retains the right to compile and use aggregated data derived from client and professional information for its internal business purposes.

"Personal Information" means any information provided by the client or collected by professionals that identifies or can be used to identify, contact, or locate a person — including name, address, phone number, email address, government-issued identifiers, and bank or credit card information. Company's Privacy Policy describes how such information is collected, used, and protected. By using the services, the client agrees to the collection and use of information in accordance with the Privacy Policy.`,
  },
  {
    heading: "Intellectual Property Rights",
    body: `This agreement does not transfer any intellectual property or rights owned by company or any third party to the client. All rights, title, and interest in company's property — including trademarks, service marks, graphics, and logos — remain solely with company. The client does not have the right to reproduce or use any trademarks of company and/or third parties, and is granted only a limited, revocable, non-exclusive right to use and access the website/application for the purpose of rendering professional services.`,
  },
  {
    heading: "Force Majeure",
    body: `Company shall not be liable for nonperformance under this agreement caused by conditions beyond its reasonable control, including war, natural disasters, and other occurrences recognized as such under international practice or as agreed upon by the parties.`,
  },
  {
    heading: "Indemnification",
    body: `The client shall indemnify, defend, and hold company and its representatives harmless for any loss or damage caused by professionals. The client agrees to hold company harmless against any loss or damage, save in cases of gross misconduct or negligence by company, its professionals, or representatives.`,
  },
  {
    heading: "Termination",
    body: `Company may terminate this agreement by providing written notice to the client, particularly where the client engages in inappropriate acts or omissions, or commits a breach of this agreement. Upon termination, the client's right to use the services and their account will cease immediately, without prejudice to any rights that accrued prior to termination.`,
  },
  {
    heading: "Notices",
    body: `All notifications regarding this agreement shall be made in writing and delivered either in person or via official email, and shall be deemed received at the time of delivery.`,
  },
  {
    heading: "Severability",
    body: `If any provision of this agreement is held invalid or unenforceable, the remaining provisions will continue to be valid and enforceable, and the invalid provision will be limited or construed to the minimum extent necessary to make it valid.`,
  },
  {
    heading: "Entire Agreement",
    body: `This agreement contains and constitutes the entire agreement between the parties with respect to its subject matter, and supersedes all prior or contemporaneous understandings, communications, and agreements, whether oral or written.`,
  },
  {
    heading: "Governing Law and Dispute Resolution",
    body: `This agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates. The parties expressly consent and submit to the exclusive jurisdiction of the Dubai courts for all matters arising under this agreement.`,
  },
  {
    heading: "Amendments and Modifications",
    body: `Company reserves the right, at its sole and absolute discretion, to change, modify, supplement, or delete any of these terms and conditions at any time.`,
  },
  {
    heading: "Assignment",
    body: `The client may not assign or transfer any of their rights, interests, or obligations under this agreement to any third party without company's prior written consent. Company may assign its rights and interests under this agreement to any person.`,
  },
  {
    heading: "Miscellaneous",
    body: `Paragraph headings used in this agreement are for reference only and shall not be used or relied upon in interpreting this agreement.`,
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Legal
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-1">
          Terms &amp; Conditions
        </h1>
        <p className="text-gray-500">
          Special for YOU. Special for US. Let&apos;s plan events at EventStan.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            These terms and conditions (the &quot;Agreement&quot;) govern the
            use and access of the application and website, including any
            content, functionality, product, and services offered by EventStan
            (hereinafter referred to as &quot;we&quot;, &quot;us&quot;, or
            &quot;Company&quot;), incorporated in Dubai under license no. 4204
            with its address: Dtec, Techno Hub, DSO, Dubai.
          </p>
          <p>
            This agreement is entered into between you as the client
            (hereinafter referred to as &quot;you&quot; or &quot;Client&quot;)
            and company (each a &quot;Party&quot;, together the
            &quot;Parties&quot;), where you wish to use the website or
            application to engage event service professionals or an entity
            providing such products and services (&quot;Professional/s&quot;).
            If you do not agree to accept and be bound by this agreement, you
            must immediately stop using the EventStan application and website.
          </p>
        </div>

        {SECTIONS.map((section, idx) => (
          <div key={idx} className="border-t border-gray-100 pt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
              <span className="w-1.5 h-5 rounded-full bg-orange-500 inline-block" />
              {section.heading}
            </h2>

            {section.body && (
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                {section.body.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            )}

            {section.list && (
              <ul className="space-y-2 mt-1">
                {section.list.map((item, lIdx) => (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed"
                  >
                    <svg
                      className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
