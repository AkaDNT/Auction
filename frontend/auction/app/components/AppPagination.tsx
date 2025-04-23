import { Pagination } from "flowbite-react";

interface Props {
  currentPage: number;
  pageCount: number;
  pageChanged: (page: number) => void;
}

export default function AppPagination({
  currentPage,
  pageCount,
  pageChanged,
}: Props) {
  const onPageChange = pageChanged;

  return (
    <div className="flex overflow-x-auto sm:justify-center">
      {pageCount >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pageCount}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
