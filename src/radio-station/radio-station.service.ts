import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { RadioStation } from './radio-station.entity';
import axios from 'axios';
import cheerio from 'cheerio';

@Injectable()
export class RadioStationService {
  private url = 'https://onlineradiobox.com';

  constructor(
    @InjectRepository(RadioStation)
    private readonly radioStationRepository: Repository<RadioStation>,
  ) {}

  async getByRadioId(radioId: string): Promise<RadioStation> {
    return this.radioStationRepository.findOneBy({ radioId });
  }

  async getByTags(tags: string): Promise<RadioStation[]> {
    return this.radioStationRepository.findBy({
      tags: Like(`%${tags}%`),
    });
  }

  async getAll(): Promise<RadioStation[]> {
    return this.radioStationRepository.find();
  }

  async create(country: string) {
    const axiosResponse = await axios.get(this.url + `/${country}`);
    const $ = cheerio.load(axiosResponse.data);
    const stationsList = $('.stations-list .stations__station');
    stationsList.each((i, el) => {
      const station = {
        radioId: '',
        title: '',
        country: '',
        stream: '',
        website: '',
        url: this.url,
        imgUrl: 'https:',
        tags: [],
      };
      const playButton = $(el).children('.station_play');
      station.radioId = playButton.attr('radioid');
      station.stream = playButton.attr('stream');
      const radioLink = $(el).children('figure').children('a');
      station.title = radioLink.children('.station__title__name').text();
      station.url += radioLink.attr('href');
      station.imgUrl += radioLink.children('.station__title__logo').attr('src');
      this.response(station).then((res) => {
        const radioStation = new RadioStation();
        radioStation.radioId = res.radioId;
        radioStation.title = res.title;
        radioStation.country = res.country;
        radioStation.stream = res.stream;
        radioStation.website = res.website;
        radioStation.url = res.url;
        radioStation.imgUrl = res.imgUrl;
        radioStation.tags = res.tags;
        this.radioStationRepository.save(radioStation);
      });
    });
  }

  async response(radioStation: any) {
    return new Promise((resolve): any => {
      this.parseRadioStation(radioStation.url).then((response) => {
        resolve(response);
      });
    }).then((response) => {
      Object.entries(response).forEach((entry) => {
        const [key, value] = entry;
        if (key === 'website') radioStation.website = value;
        else if (key === 'country') radioStation.country = value;
        else value.forEach((tag) => radioStation.tags.push(tag));
      });
      return radioStation;
    });
  }

  async parseRadioStation(url: string): Promise<object> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const radioStationData = $('.station');
    const radioStation = {
      country: '',
      website: null,
      tags: [],
    };
    radioStation.country = $('.breadcrumbs li a span:first').text();
    radioStationData.each((i, el) => {
      radioStation.website = $(el)
        .find('.station__reference--web')
        .attr('href');
      $(el)
        .find('.station__tags li')
        .each((tagId, tagEl) => {
          radioStation.tags.push($(tagEl).children('.ajax').text());
        });
    });
    return radioStation;
  }
}
