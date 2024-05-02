import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const pricingFaqData = [
  {
    id: "item-1",
    question: "What is the cost of the free plan?",
    answer: "Our free plan is completely free, with no charges whatsoever. It's a fantastic way to get started and try out our basic features.",
  },
  {
    id: "item-2",
    question: "How much does the Pro Monthly plan cost?",
    answer: "The Pro plan is priced at $10 per month. It provides 30 credits, each credit can be used to generate one meditation, and is billed on a monthly basis.",
  },
  {
    id: "item-3",
    question: "Do you offer any annual subscription plans?",
    answer: "Not yet, but we are planning to introduce an annual subscription plan soon. Stay tuned for updates!",
  },
];

export function PricingFaq() {
  return (
    <section className="container max-w-3xl py-2">
      <div className="mb-14 space-y-6 text-center">
        <h1 className="text-balance text-center font-heading text-3xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-md text-balance text-muted-foreground">
          Explore our FAQs to find quick answers to common questions.
          If you need further assistance, don&apos;t hesitate to contact us!
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {pricingFaqData.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent>{faqItem.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}