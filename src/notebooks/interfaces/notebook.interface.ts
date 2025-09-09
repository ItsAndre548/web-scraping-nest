export interface Notebook {
  title: string;
  link: string;
  variations?: Details[];
}

export interface Details {
    hdd: string;
    price: string;
    onStock: boolean;

}
