export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Se a rota começa com /api, redireciona para o Worker
    if (url.pathname.startsWith('/api')) {
      // Remove o prefixo /api (4 caracteres) pois o Worker não o usa
      const pathWithoutApi = url.pathname.substring(4);
      const apiUrl = new URL(pathWithoutApi + url.search, 'https://barreiro360-api.capital-finance.workers.dev');

      return fetch(new Request(apiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }

    // Caso contrário, deixa o Pages servir normalmente
    return fetch(request);
  },
};
