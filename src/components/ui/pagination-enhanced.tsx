import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface PaginationEnhancedProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  className?: string;
}

export function PaginationEnhanced({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}: PaginationEnhancedProps) {
  const [goToInput, setGoToInput] = useState('');

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Số trang hiển thị xung quanh trang hiện tại (2 bên)

    // Luôn hiển thị trang đầu tiên
    pages.push(1);

    // Tính range xung quanh trang hiện tại
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Nếu có khoảng trống giữa trang 1 và start, thêm ellipsis
    if (start > 2) {
      pages.push('...');
    }

    // Thêm các trang xung quanh trang hiện tại
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Nếu có khoảng trống giữa end và trang cuối, thêm ellipsis
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Luôn hiển thị trang cuối cùng (nếu có nhiều hơn 1 trang)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleGoToPage = () => {
    const page = parseInt(goToInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToInput('');
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm', className)}>
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-8 w-8 rounded-full p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="text-gray-400 px-2">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = currentPage === pageNum;

          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'h-8 w-8 rounded-full p-0 font-medium',
                isActive && 'bg-blue-500 text-white hover:bg-blue-600'
              )}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-8 w-8 rounded-full p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Items Per Page Dropdown */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <Select value={itemsPerPage.toString()} onValueChange={(val) => onItemsPerPageChange?.(parseInt(val))}>
            <SelectTrigger className="h-8 w-24 border-2 border-blue-500 bg-white text-sm font-medium rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Go To Page Input */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
        <span className="text-sm text-gray-600">Go to</span>
        <Input
          type="number"
          placeholder=""
          value={goToInput}
          onChange={(e) => setGoToInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleGoToPage();
            }
          }}
          className="h-8 w-16 text-sm border-2 border-gray-300 rounded-md"
          min="1"
          max={totalPages}
        />
        <span className="text-sm text-gray-600">Page</span>
      </div>
    </div>
  );
}
