import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Garden State AI and how we use AI to help you find your perfect home in New Jersey.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">About Garden State AI</h1>

      <p className="mt-6 leading-relaxed text-gray-600">
        Garden State AI is an AI-powered real estate platform designed to make
        finding your next home in New Jersey faster, smarter, and easier. We
        combine cutting-edge artificial intelligence with comprehensive MLS data
        to deliver the most relevant property matches instantly.
      </p>

      <div className="mt-10 rounded-xl bg-white p-8 shadow-md">
        <h2 className="text-xl font-bold text-navy">Your Agent: Julio Reynoso</h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          Julio Reynoso is a licensed New Jersey real estate agent with deep knowledge
          of the local market. Whether you&apos;re buying your first home,
          investing in property, or selling, Julio and the Garden State AI team
          provide personalized guidance every step of the way.
        </p>
      </div>

      <div className="mt-10 rounded-xl bg-white p-8 shadow-md">
        <img src="/bhg-green-team-logo.jpg" alt="Better Homes and Gardens Real Estate | Green Team" className="h-12 w-auto" />
        <p className="mt-3 leading-relaxed text-gray-600">
          Garden State AI is proudly brokered by Better Homes and Gardens | Green Team,
          a trusted name in real estate with a commitment to innovation and client success.
          With deep roots in New Jersey and a national brand behind them, Green Team provides
          the support and resources needed to deliver an exceptional real estate experience.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>293 Route 94, Vernon, NJ 07462</p>
          <p>Office: <a href="tel:+19738147344" className="text-indigo-600 hover:underline">973.814.7344</a> | Fax: 845.920.7669</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/contact"
          className="inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-yellow-500"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
