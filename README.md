## url-query-state

React 애플리케이션에서 URL 쿼리스트링을 상태처럼 읽고 부분 업데이트하는 라이브러리.

- **대상**: React 18/19 (Next.js, Vite, CRA 등)
- **Peer deps**: react ^18 || ^19
- **클라이언트 전용**: 브라우저 환경에서만 사용

---

## 설치

```bash
npm install url-query-state
```

## 사용

```ts
import { useQueryState } from "url-query-state";
```

---

## 빠른 예제

```ts
const { values, setValues } = useQueryState({ q: "", page: 1 });

// 검색어와 페이지 업데이트
setValues({ q: "react", page: 1 });

// 특정 키만 삭제 (undefined 전달)
setValues({ q: undefined }); // ?q= 파라미터 제거

// 배열 값 설정
setValues({ categories: ["frontend", "backend"] }); // ?categories=frontend&categories=backend
```

---

## API

```ts
useQueryState(
  initial?: Partial<QueryObject>,
  mode?: "push" | "replace" // 기본: "push"
) => { values, setValues }
```

- **values**: `Record<string, string | number | string[] | undefined>`
- **setValues(patch)**: URL 쿼리에 부분 업데이트
  - `undefined`/`""`(trim 후)/`[]` → 해당 키 삭제
  - 배열은 `?k=a&k=b`로 직렬화

### 타입

```ts
export type QueryObject = Record<
  string,
  string | number | string[] | undefined
>;
```

---

## 동작 규칙

- **숫자 자동 변환**: 쿼리 값이 유효한 숫자이고 문자열 표현이 정확히 일치할 때만 `number`로 변환
  - 예: `"1" -> 1`, `"1.5" -> 1.5`
  - 예외: `"01"`, `"1.0"` 같은 형식은 문자열로 유지 (원본 형식 보존)
- **배열 처리**: 중복 키는 `string[]`로 제공 (`?category=A&category=B`)
- **빈 값 정리**: 빈 문자열, `undefined`, 빈 배열은 자동으로 URL에서 제거
- **라우터 모드**:
  - `"push"` (기본값): 브라우저 히스토리에 새 항목 추가
  - `"replace"`: 현재 히스토리 항목 대체

---

## 🔄 어댑터 패턴

**어댑터 패턴**을 적용하여 다양한 React 환경에서 사용할 수 있습니다.

### 브라우저 어댑터 (현재 구현됨)

기본 제공되는 브라우저 어댑터는 `window.history` API와 `useSyncExternalStore`를 사용하여 구현되었습니다:

```ts
import { useQueryState } from "url-query-state";

// 브라우저 어댑터를 사용 (기본값)
const { values, setValues } = useQueryState({ page: 1, q: "" });
```

**특징:**

- ✅ **Next.js App Router**: 클라이언트 컴포넌트에서 사용
- ✅ **Vite**: React SPA 프로젝트에서 사용
- ✅ **Create React App**: 표준 React 앱에서 사용
- ✅ **SSR 안전**: 서버 사이드에서도 안전하게 동작
- ✅ **History API**: `pushState`/`replaceState` 지원
- ✅ **반응형**: URL 변경 시 자동으로 리렌더링

### 어댑터 구조

라이브러리는 어댑터 패턴으로 설계되어 있어 확장이 용이합니다:

```ts
// 어댑터 인터페이스
export type AdapterHooks = {
  pathname: string;
  search: string;
  navigate: (url: string, mode: UpdateMode) => void;
};

// 어댑터 생성 함수
export function createUseQueryState(useAdapter: () => AdapterHooks) {
  // 핵심 로직...
}
```

**현재 구현된 어댑터:**

- ✅ **Browser Adapter**: `window.history` + `useSyncExternalStore` 기반
