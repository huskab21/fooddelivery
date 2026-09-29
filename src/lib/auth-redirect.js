// Login/Sign up хийсний дараа хэрэглэгчийг буцаах газрыг санах helper.
// sessionStorage ашигласан тул sign up -> login гэж хэд хэдэн хуудас дамжсан ч алга болохгүй,
// харин browser tab хаагдвал автоматаар цэвэрлэгдэнэ.

const KEY = "postAuthRedirect";
const TTL_MS = 30 * 60 * 1000; // 30 минутаас хуучин бол тоохгүй

export function rememberCheckoutIntent(path) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({ path: path || "/", openCart: true, savedAt: Date.now() }),
  );
}

function readIntent() {
  try {
    const intent = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (!intent) return null;
    if (Date.now() - intent.savedAt > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return intent;
  } catch {
    return null;
  }
}

// Login / Sign up хуудас: амжилттай нэвтэрсний дараа хаашаа явахыг авна (устгахгүй)
export function getAuthRedirectPath() {
  return readIntent()?.path || "/";
}

// Header: cart-аа дахин нээх шаардлагатай эсэхийг шалгаад, ашигласны дараа устгана
export function consumeCheckoutIntent() {
  const intent = readIntent();
  if (intent) sessionStorage.removeItem(KEY);
  return intent;
}