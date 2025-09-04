import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Notebook } from './interfaces/notebook.interface';

@Injectable()
export class NotebooksService {
  private readonly BASE_URL =
    'https://webscraper.io/test-sites/e-commerce/static/computers/laptops?page=';

  async scrapePage(page: number, brand?: string): Promise<Notebook[]> {
    const response = await axios.get(`${this.BASE_URL}${page}`);
    const $ = cheerio.load(response.data);
    const notebooks: Notebook[] = [];

    $('.caption').each(function () {
      const price = $(this).find('h4.price').text().trim();
      const title = $(this).find('h4 a.title').text().trim();

      if (!brand || title.toLowerCase().includes(brand)) {
        notebooks.push({ title, price });
      }
    });

    return notebooks;
  }

  async scrapeAllPages(brand?: string): Promise<Notebook[]> {
    const totalPages = 20;
    const promises: Promise<Notebook[]>[] = [];

    for (let page = 1; page <= totalPages; page++) {
      promises.push(
        this.scrapePage(page, brand).catch((err) => {
          console.error(`Erro na página ${page}:`, err);
          return [];
        }),
      );
    }

    const results = await Promise.all(promises);
    return results
      .flat()
      .sort(
        (a, b) =>
          parseFloat(a.price.replace('$', '')) -
          parseFloat(b.price.replace('$', '')),
      );
  }
}
