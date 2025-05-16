import { useAtom } from "jotai";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pageTranslateRangeSchema } from "@/types/config/config";
import { PageTranslateRange } from "@/types/config/config";
import { configFields } from "@/utils/atoms/config";
import { PAGE_TRANSLATE_RANGE_ITEMS } from "@/utils/constants/config";

export default function TranslationConfigSection() {
  const [pageTranslate, setPageTranslate] = useAtom(configFields.pageTranslate);
  return (
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold">
        {i18n.t("options.translationConfig.title")}
      </h2>
      <div className="mx-auto grid max-w-sm items-center gap-0.5">
        <label className="text-sm font-medium">
          {i18n.t("options.translationConfig.translateRange.title")}
        </label>
        <Select
          value={PAGE_TRANSLATE_RANGE_ITEMS[pageTranslate.range].label}
          onValueChange={(value: PageTranslateRange) =>
            setPageTranslate({
              ...pageTranslate,
              range: value,
            })
          }
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue asChild>
              <span>
                {i18n.t(
                  `options.translationConfig.translateRange.range.${pageTranslate.range}`,
                )}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {pageTranslateRangeSchema.options.map((range) => (
                <SelectItem key={range} value={range}>
                  {i18n.t(
                    `options.translationConfig.translateRange.range.${range}`,
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
