import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  id: number;
  name: string;
}

interface AthleteFiltersProps {
  years: number[];
  disciplines: FilterOption[];
  selectedYear: number | null;
  selectedDiscipline: string | null;
  onYearChange: (year: number | null) => void;
  onDisciplineChange: (discipline: string | null) => void;
}

export function AthleteFilters({ years, disciplines, selectedYear, selectedDiscipline, onYearChange, onDisciplineChange }: AthleteFiltersProps) {
  return (
    <div className="flex flex-wrap">
      
      {/* Year filter */}
      <div className="mr-4">
        <Select
          value={selectedYear?.toString() ?? "all"}
          onValueChange={(val) => onYearChange(val === "all" ? null : Number(val))}
        >

          <SelectTrigger>
            <SelectValue placeholder="Rok" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Všetky roky</SelectItem>

            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>
      </div>

      {/* Discipline/Category filter */}
      <div className="w-64">
        <Select
          value={selectedDiscipline ?? "all"}
          onValueChange={(val) => onDisciplineChange(val === "all" ? null : val)}
        >

          <SelectTrigger>
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Všetky kategórie</SelectItem>

            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>
      </div>

    </div>
  );
}