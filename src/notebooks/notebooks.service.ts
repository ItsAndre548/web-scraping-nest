import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Notebook, Details } from './interfaces/notebook.interface';

@Injectable()
export class NotebooksService {
  private readonly BASE_URL = 'https://webscraper.io'
  private readonly URL_NOTEBOOKS =
    '/test-sites/e-commerce/static/computers/laptops?page=';

  async scrapePage(page: number, brand?: string): Promise<Notebook[]> {
 
      const response = await axios.get(`${this.BASE_URL}${this.URL_NOTEBOOKS}${page}`);
      const $ = cheerio.load(response.data);
      const notebooks: Notebook[] = [];

      $('.caption').each(function () {
        const title = $(this).find('h4 a.title').text().trim();
        const link = $(this).find('h4 a').attr('href') || '';


        if (!brand || title.toLowerCase().includes(brand)) {
          notebooks.push({
            title,
            link
          });
        }
      });
      return notebooks;
   
  }

  async scrapeAllPages(brand?: string): Promise<Notebook[]> {
    const BASE_URL = 'https://webscraper.io'
    const totalPages = 20;
    const promiseNotebook: Promise<Notebook[]>[] = [];
    for (let page = 1; page <= totalPages; page++) {
      promiseNotebook.push(
        this.scrapePage(page, brand).catch((err) => {
          console.error(`Erro na página ${page}:`, err);
          return [];
        }),
      );
    }
    const results = await Promise.all(promiseNotebook);
    const notebooks = await Promise.all(
  results.flat().map(async (result) => {
    const response = await axios.get(`${BASE_URL}${result.link}`);
    const $ = cheerio.load(response.data);
    const details: Details[] = [];

    let price = $('.price').text().trim() as any;
    price = parseInt(price.substring(1, price.length));

    $('.swatch').each((i, el) => {
      details.push({
        hdd: $(el).attr('value') || '',
        price: price + i * 20,
        onStock: !$(el).is(':disabled')
      });
    });

    return {
      title: result.title,
      link: result.link,
      variations: details,
    };
  }),
);

return notebooks;

  }
}
