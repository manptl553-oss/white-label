export const getHostedAuthErrorMeta = (error: any = null) => {
  if (!error) {
    return {
      type: "unknown",
      title: "Something went wrong",
      subtitle: "Unexpected error during initialization.",
      causes: [],
      hint: "Try reloading the page.",
    };
  }

  const message = error?.message?.toLowerCase?.() ?? "";
  const name = error?.name?.toLowerCase?.() ?? "";
  const status = error?.statusCode;

  // ✅ Credentials / configuration issues
  if (
    status === 401 ||
    status === 403 ||
    name === "invalid_configuration" ||
    name === "invalid_client"
  ) {
    return {
      type: "credentials",
      title: "Configuration Error",
      subtitle: "Invalid configuration.",
      causes: [
        { icon: "🔑", label: "Invalid client credentials" },
        { icon: "🚫", label: "Credentials may be revoked" },
        { icon: "🌍", label: "Wrong environment configuration" },
      ],
      hint: "Verify your client configuration.",
    };
  }

  // ✅ Endpoint / route issue
  if (status === 404 || message.includes("not found")) {
    return {
      type: "server",
      title: "Endpoint Not Found",
      subtitle: "Invalid API endpoint.",
      causes: [
        { icon: "🔗", label: "Incorrect API URL" },
        { icon: "⚙️", label: "Route not deployed" },
        { icon: "🌐", label: "Wrong environment base URL" },
      ],
      hint: "Check your API endpoint configuration.",
    };
  }

  // ✅ Server issues
  if ([500, 502, 503, 504].includes(status) || message.includes("server")) {
    return {
      type: "server",
      title: "Server Error",
      subtitle: "Authentication service unavailable.",
      causes: [
        { icon: "🖥️", label: "Backend not running" },
        { icon: "⏱️", label: "Request timeout" },
        { icon: "🚧", label: "Service unavailable" },
      ],
      hint: "Ensure backend service is running.",
    };
  }

  // ✅ Network issues
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("cors")
  ) {
    return {
      type: "network",
      title: "Network Error",
      subtitle: "Unable to reach server.",
      causes: [
        { icon: "🌐", label: "Server not reachable" },
        { icon: "🔌", label: "CORS issue" },
        { icon: "🚪", label: "Incorrect host or port" },
      ],
      hint: "Check network and server configuration.",
    };
  }

  // ✅ Fallback
  return {
    type: "unknown",
    title: "Initialization Failed",
    subtitle: "Unexpected error occurred.",
    causes: [
      { icon: "❓", label: "Unknown issue" },
      { icon: "🔄", label: "Try again" },
    ],
    hint: "Check console for details.",
  };
};
