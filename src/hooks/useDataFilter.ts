export type DateFilter = "all" | "daily" | "weekly" | "monthly" | "yearly";

export const useDateFilter = (
  data: any[],
  dateKey: string,
  filter: DateFilter
) => {
  const filtered = data.filter((item) => {
    if (filter === "all") return true;

    const today = new Date();
    const date = new Date(item[dateKey].toDate());
    let match = false;

    switch (filter) {
      case "daily":
        match =
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate();
        break;
      case "weekly": {
        const oneJan = new Date(today.getFullYear(), 0, 1);
        const weekOfYear = Math.ceil(
          ((today.getTime() - oneJan.getTime()) / 86400000 +
            oneJan.getDay() +
            1) /
            7
        );
        const dataWeekOfYear = Math.ceil(
          ((date.getTime() - oneJan.getTime()) / 86400000 +
            oneJan.getDay() +
            1) /
            7
        );
        match = weekOfYear === dataWeekOfYear;
        break;
      }
      case "monthly":
        match =
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth();
        break;
      case "yearly":
        match = date.getFullYear() === today.getFullYear();
        break;
    }

    return match;
  });

  return filtered;
};
