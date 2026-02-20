import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Use our size charts to find the perfect fit for women, men and kids.",
};

// Minimal table component using Tailwind
function SizeTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h) => (
              <th
                key={h}
                className="border-b px-4 py-2.5 text-left font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/20"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <StaticPage
      title="Size Guide"
      subtitle="All measurements are in centimetres unless stated otherwise. When between sizes, we recommend sizing up."
    >
      <section className="space-y-4">
        <h2 className="font-heading text-base font-bold">
          Women&apos;s Clothing
        </h2>
        <SizeTable
          headers={["Size", "UK", "Bust (cm)", "Waist (cm)", "Hips (cm)"]}
          rows={[
            ["XS", "6", "80–83", "62–65", "88–91"],
            ["S", "8–10", "84–88", "66–70", "92–96"],
            ["M", "12", "89–93", "71–75", "97–101"],
            ["L", "14", "94–98", "76–80", "102–106"],
            ["XL", "16", "99–104", "81–86", "107–112"],
            ["2XL", "18", "105–110", "87–92", "113–118"],
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-base font-bold">
          Men&apos;s Clothing
        </h2>
        <SizeTable
          headers={["Size", "Chest (cm)", "Waist (cm)", "Hip (cm)"]}
          rows={[
            ["XS", "83–87", "73–77", "87–91"],
            ["S", "88–93", "78–82", "92–96"],
            ["M", "94–99", "83–87", "97–101"],
            ["L", "100–105", "88–93", "102–107"],
            ["XL", "106–111", "94–99", "108–113"],
            ["2XL", "112–117", "100–105", "114–119"],
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-base font-bold">Women&apos;s Shoes</h2>
        <SizeTable
          headers={["EU", "UK", "US", "Foot length (cm)"]}
          rows={[
            ["36", "3", "5.5", "22.5"],
            ["37", "4", "6.5", "23.5"],
            ["38", "5", "7.5", "24.0"],
            ["39", "6", "8.5", "25.0"],
            ["40", "7", "9.5", "26.0"],
            ["41", "8", "10.5", "26.5"],
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-base font-bold">Men&apos;s Shoes</h2>
        <SizeTable
          headers={["EU", "UK", "US", "Foot length (cm)"]}
          rows={[
            ["40", "6.5", "7.5", "25.5"],
            ["41", "7", "8", "26.0"],
            ["42", "8", "9", "26.5"],
            ["43", "9", "10", "27.5"],
            ["44", "10", "11", "28.0"],
            ["45", "11", "12", "29.0"],
            ["46", "12", "13", "29.5"],
          ]}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-base font-bold">How to Measure</h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>
            <strong>Bust:</strong> Measure around the fullest part of your
            chest, keeping the tape parallel to the floor.
          </li>
          <li>
            <strong>Waist:</strong> Measure around your natural waist — the
            narrowest part of your torso.
          </li>
          <li>
            <strong>Hips:</strong> Stand with feet together and measure around
            the fullest part of your hips.
          </li>
          <li>
            <strong>Foot length:</strong> Stand on a piece of paper, mark the
            heel and longest toe, and measure the distance.
          </li>
        </ul>
      </section>

      <p className="text-xs text-muted-foreground">
        Still unsure? Email{" "}
        <a href="mailto:support@riziki.co.ke" className="underline">
          support@riziki.co.ke
        </a>{" "}
        with the item and your measurements and we&apos;ll advise the best fit.
      </p>
    </StaticPage>
  );
}
