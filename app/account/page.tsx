// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function AccountPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   function handleLogin(e: React.FormEvent) {
//     e.preventDefault();

//     // Temporary mock login

//     if (username && password) {
//       alert(`Welcome back, ${username}!`);
//       router.push("/");                                           // redirect to homepage after login
//     } else {
//       alert("Please fill in all fields");
//     }
//   }

//   function handleSignup() {
//     router.push("/account/signup");
//   }

//   return (
//     <div
//       style={{
//         backgroundColor: "#e9ecf2",
//         height: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: "#fff",
//           width: "320px",
//           borderRadius: "6px",
//           boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
//           padding: "28px",
//           textAlign: "center",
//         }}
//       >
//         <div
//           style={{
//             fontSize: "20px",
//             fontWeight: "600",
//             color: "#7d7d7d",
//             marginBottom: "18px",
//           }}
//         >
//           ☁ Login
//           <span style={{ color: "#a874d1", marginLeft: "4px" }}>Area</span>
//         </div>

//         <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
//           <label
//             style={{
//               fontSize: "13px",
//               color: "#555",
//               display: "block",
//               marginBottom: "4px",
//             }}
//           >
//             Username
//           </label>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             style={inputStyle}
//           />

//           <label
//             style={{
//               fontSize: "13px",
//               color: "#555",
//               display: "block",
//               marginTop: "10px",
//               marginBottom: "4px",
//             }}
//           >
//             Password
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={inputStyle}
//           />

//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginTop: "18px",
//             }}
//           >
//             <button type="submit" style={loginBtn}>
//               Login
//             </button>
//             <button type="button" onClick={handleSignup} style={signupBtn}>
//               Signup
//             </button>
//           </div>
//         </form>

//         <div
//           style={{
//             marginTop: "24px",
//             fontSize: "13px",
//             color: "#999",
//           }}
//         >
//           Notespace
          
//         </div>
//       </div>
//     </div>
//   );
// }

// /* --- Styles --- */
// const inputStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "8px 10px",
//   border: "1px solid #ccc",
//   borderRadius: "4px",
//   fontSize: "14px",
//   outline: "none",
//   color: "#333",
// };

// const loginBtn: React.CSSProperties = {
//   backgroundColor: "#8b8b8b",
//   color: "#fff",
//   border: "none",
//   padding: "6px 14px",
//   borderRadius: "4px",
//   cursor: "pointer",
//   fontSize: "14px",
// };

// const signupBtn: React.CSSProperties = {
//   backgroundColor: "#fff",
//   border: "1px solid #999",
//   color: "#666",
//   padding: "6px 14px",
//   borderRadius: "4px",
//   cursor: "pointer",
//   fontSize: "14px",
// };
