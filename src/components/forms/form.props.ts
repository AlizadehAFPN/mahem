/**
 * Shared prop shape for the four ad-creation forms (CarForm, EstateForm,
 * OfferForm, CommonForm).
 *
 * They are siblings chosen between by category — CreateAdsDetailsScreen and
 * EditAdScreen each render exactly one of them with the same props — so the
 * contract belongs in one place rather than being re-inferred (and drifting)
 * four times.
 *
 * Everything is optional. Each form reads only the subset it needs and already
 * guards every use, and the two screens genuinely pass different subsets:
 * OfferForm takes no category at all, EstateForm takes two levels of one. A
 * required prop here would turn a working call site into a type error without
 * changing what the code does.
 *
 * The category/ad objects stay `any` on purpose: they are backend payloads
 * whose shape varies by category (see mapAdvertisement), and pretending
 * otherwise here would be a fiction the rest of the file would have to work
 * around.
 */
export interface AdFormProps {
  /** Root category, when the caller resolved one — CommonForm branches on its title. */
  mainCategory?: any;
  /** Second-level category (CarForm, EstateForm). */
  subCategory?: any;
  /** Third-level category (EstateForm only). */
  subsubCategory?: any;
  /**
   * The advertisement being edited. Absent when creating: each form seeds its
   * initial state from this when present, and from empty values when not.
   */
  editItem?: any;
  /**
   * Submit trigger, not a boolean — the parent screen owns the «ثبت» button,
   * and pushes a new string containing 'send' to ask the form to validate and
   * submit. A fresh value each time is what lets the same request be made
   * twice; see each form's `useEffect(..., [send])`.
   */
  send?: string;
  /** Called with the validated payload once the form accepts it. */
  onSend?: (payload: any) => void;
  /** Store this discount belongs to (OfferForm only). */
  storeId?: string;
}
