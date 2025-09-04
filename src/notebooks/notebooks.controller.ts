import { Controller, Get, Query } from '@nestjs/common';
import { NotebooksService } from './notebooks.service';
import { Notebook } from './interfaces/notebook.interface';

@Controller()
export class NotebooksController {
  constructor(private readonly notebooksService: NotebooksService) {}

  @Get()
  getHome() {
    return `<h1>Servidor rodando!<br><br> acesse a rota /notebooks para ver todos os notebooks<br> OU <br> /notebooks?brand=NOME DA MARCA</h1>`;
  }

  @Get('notebooks')
  async getNotebooks(
    @Query('brand') brand?: string,
  ): Promise<Notebook[] | { error: string }> {
    try {
      const notebooks = await this.notebooksService.scrapeAllPages(
        brand?.toLowerCase(),
      );
      return notebooks;
    } catch (err) {
      console.error(err);
      return { error: 'Erro ao buscar notebooks' };
    }
  }
}
