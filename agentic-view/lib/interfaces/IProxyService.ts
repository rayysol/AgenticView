// Interface Segregation Principle: Proxy service contract
export interface IProxyService {
  fetchPage(url: string): Promise<string>;
  injectScript(html: string, scriptPath: string): string;
  stripHeaders(html: string): string;
  rewriteUrls(html: string, baseUrl: string): string;
}
