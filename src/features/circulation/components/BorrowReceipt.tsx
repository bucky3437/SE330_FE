import { CheckoutResponse } from "../types/circulation.type";
import { formatDate } from "./circulationHelpers";

export function BorrowReceipt({ receiptData }: { receiptData: CheckoutResponse | null }) {
  if (!receiptData) return null;

  return (
    <div className="w-[80mm] bg-white p-4 text-black font-sans text-sm">
      <div className="text-center mb-4 border-b border-dashed border-black pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide">Athenaeum Library</h1>
        <p className="text-xs mt-1">Borrow Receipt</p>
        <p className="text-xs mt-2">{new Date().toLocaleString()}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase font-bold border-b border-black pb-1 mb-2">Transaction Info</p>
        <div className="flex justify-between text-xs mt-1">
          <span>Borrow ID:</span>
          <span className="font-bold">{receiptData.borrowId ?? receiptData.id}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>Member:</span>
          <span className="font-bold">{receiptData.memberName ?? "-"}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase font-bold border-b border-black pb-1 mb-2">Item Details</p>
        <p className="font-bold text-base leading-tight mb-1">{receiptData.bookTitle ?? receiptData.title}</p>
        <div className="flex justify-between text-xs">
          <span>Barcode:</span>
          <span>{receiptData.barcode}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black pt-3 mb-4 text-xs">
        <div className="flex justify-between mb-1">
          <span>Borrow Date:</span>
          <span>{receiptData.checkoutAt ? formatDate(receiptData.checkoutAt) : formatDate(new Date().toISOString())}</span>
        </div>
        <div className="flex justify-between font-bold text-sm mt-2">
          <span>Due Date:</span>
          <span>{formatDate(receiptData.dueAt ?? receiptData.dueDate)}</span>
        </div>
      </div>

      <div className="text-center text-xs mt-6 border-t border-black pt-4">
        <p>Please return the item on or before the due date to avoid late fees.</p>
        <p className="mt-3 font-bold uppercase">Thank you!</p>
      </div>
    </div>
  );
}
