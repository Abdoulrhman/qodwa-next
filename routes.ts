/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/auth/new-verification"
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /profile
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password"
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/en/profile';
export const getDefaultLoginRedirect = (locale : string) => `/${locale}/profile`;


function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);
  let leftProduct = 1;
  let rightProduct = 1;

  // Build the left product array
  for (let i = 0; i < n; i++) {
    result[i] = leftProduct;
    leftProduct *= nums[i]; // Multiply the product of all elements to the left
  }

  // Build the right product array and multiply it directly into the result
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct; // Multiply the right product to the existing result
    rightProduct *= nums[i];   // Multiply the product of all elements to the right
  }

  return result;
}

const nums = [1, 2, 3, 4];
console.log(productExceptSelf(nums)); // Output: [24, 12, 8, 6]
