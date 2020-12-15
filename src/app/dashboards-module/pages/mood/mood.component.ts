import { Component, OnInit, HostListener } from '@angular/core';
import { ChartOptionsType } from '../../components/apex-charts/types/chartOptions';
import { PieChartOptions } from '../../components/apex-charts/interfaces/options/pie';
import { Dashboard } from '../../components/apex-charts/classes/dashboardCommon';
import { MatExpansionPanel } from '@angular/material';
import { Employee } from '../../../shared/models/employee.model';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-surveys-mood',
  templateUrl: './mood.component.html',
  styleUrls: ['./mood.component.scss'],
})
export class MoodComponent extends Dashboard implements OnInit {
  public mepOpen: boolean;
  public showDashboard: boolean;
  public user: Employee;
  public chartSize: { width?: number, heigth?: number };
  public name: string;
  public email: string;

  chart: {
    chartOptions: Partial<PieChartOptions> | Partial<ChartOptionsType>
  };

  dashboard: Array<{
    chart: {
      chartOptions: Partial<ChartOptionsType> | any
    }
  }> = [];

  constructor(private userService: UserService) {
    super(Dashboard.getChartOptionsTemplate('pie'));
    this.innerWidth = window.innerWidth;
    this.user = this.userService.getUser();
    this.setChartSize();
    this.showDashboard = false;
    this.mepOpen = true;
    this.chart = {
      chartOptions: {
        series: [44, 55, 13, 43, 22],
        chart: {
          type: 'donut',
          width: 250,
          background: 'https://storage.googleapis.com/uploads-dev-rrhh-cloud/admin/avatar/photo_1602687101424.png',
        },
        dataLabels: {
          enabled: true,
          formatter: (v) => v / 10
        },
        plotOptions: {
          pie: {
            donut: {
              size: '45px',
              labels: {
                value: {},
                total: {}
              }
            },

          }
        },
        fill: {
          colors: ['#2e592c', '#50894d', '#66bc62']
        },
        labels: ['Team A', 'Team B', 'Team C']
      }
    };

    this.dashboard[0] = {
      chart: {
        chartOptions: {
          series: [
            {
              name: 'distibuted',
              data: [21, 22, 10, 28, 16, 21, 13, 30]
            }
          ],

          chart: {

            toolbar: {
              show: false
            },
            type: 'bar',
            events: {
              click: function (chart, w, e) {
                // console.log(chart, w, e)
              }
            },

          },
          colors: [
            '#008FFB',
            '#00E396',
            '#FEB019',
            '#FF4560',
            '#775DD0',
            '#546E7A',
            '#26a69a',
            '#D10CE8'
          ],
          plotOptions: {
            bar: {
              columnWidth: '45%',
              distributed: true
            }
          },
          dataLabels: {
            enabled: false
          },
          legend: {
            show: false
          },
          grid: {
            show: false
          },
          xaxis: {
            categories: [
              ['John', 'Doe'],
              ['Joe', 'Smith'],
              ['Jake', 'Williams'],
              'Amber',
              ['Peter', 'Brown'],
              ['Mary', 'Evans'],
              ['David', 'Wilson'],
              ['Lily', 'Roberts']
            ],
            labels: {
              style: {
                colors: [
                  '#008FFB',
                  '#00E396',
                  '#FEB019',
                  '#FF4560',
                  '#775DD0',
                  '#546E7A',
                  '#26a69a',
                  '#D10CE8'
                ],
                fontSize: '12px'
              }
            }
          }
        }
      }
    };
    this.dashboard[1] = {
      chart: {
        chartOptions: {
          series: [
            {
              'name': 'Q1',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 25.0
                },
                {
                  'x': '11/08/2020',
                  'y': 25.0
                },
                {
                  'x': '13/08/2020',
                  'y': 25.0
                },
                {
                  'x': '14/08/2020',
                  'y': 25.0
                },
                {
                  'x': '18/08/2020',
                  'y': 89.29
                },
                {
                  'x': '20/08/2020',
                  'y': 25.0
                },
                {
                  'x': '27/08/2020',
                  'y': 100.0
                },
                {
                  'x': '04/09/2020',
                  'y': 100.0
                },
                {
                  'x': '07/09/2020',
                  'y': 100.0
                },
                {
                  'x': '01/11/2020',
                  'y': 25.0
                },
                {
                  'x': '02/11/2020',
                  'y': 25.0
                },
                {
                  'x': '03/11/2020',
                  'y': 100.0
                },
                {
                  'x': '04/11/2020',
                  'y': 25.0
                },
                {
                  'x': '05/11/2020',
                  'y': 100.0
                },
                {
                  'x': '06/11/2020',
                  'y': 25.0
                }
              ]
            },
            {
              'name': 'Q2',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 80.0
                },
                {
                  'x': '11/08/2020',
                  'y': 60.0
                },
                {
                  'x': '13/08/2020',
                  'y': 100.0
                },
                {
                  'x': '14/08/2020',
                  'y': 100.0
                },
                {
                  'x': '18/08/2020',
                  'y': 85.71
                },
                {
                  'x': '20/08/2020',
                  'y': 80.0
                },
                {
                  'x': '27/08/2020',
                  'y': 80.0
                },
                {
                  'x': '04/09/2020',
                  'y': 100.0
                },
                {
                  'x': '07/09/2020',
                  'y': 100.0
                },
                {
                  'x': '01/11/2020',
                  'y': 60.0
                },
                {
                  'x': '02/11/2020',
                  'y': 40.0
                },
                {
                  'x': '03/11/2020',
                  'y': 100.0
                },
                {
                  'x': '04/11/2020',
                  'y': 40.0
                },
                {
                  'x': '05/11/2020',
                  'y': 100.0
                },
                {
                  'x': '06/11/2020',
                  'y': 20.0
                }
              ]
            },
            {
              'name': 'Q3',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 100.0
                },
                {
                  'x': '11/08/2020',
                  'y': 100.0
                },
                {
                  'x': '13/08/2020',
                  'y': 100.0
                },
                {
                  'x': '14/08/2020',
                  'y': 100.0
                },
                {
                  'x': '18/08/2020',
                  'y': 89.29
                },
                {
                  'x': '20/08/2020',
                  'y': 25.0
                },
                {
                  'x': '27/08/2020',
                  'y': 25.0
                },
                {
                  'x': '04/09/2020',
                  'y': 25.0
                },
                {
                  'x': '07/09/2020',
                  'y': 100.0
                },
                {
                  'x': '01/11/2020',
                  'y': 100.0
                },
                {
                  'x': '02/11/2020',
                  'y': 25.0
                },
                {
                  'x': '03/11/2020',
                  'y': 100.0
                },
                {
                  'x': '04/11/2020',
                  'y': 25.0
                },
                {
                  'x': '05/11/2020',
                  'y': 100.0
                },
                {
                  'x': '06/11/2020',
                  'y': 25.0
                }
              ]
            },
            {
              'name': 'Q4',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 75.0
                },
                {
                  'x': '11/08/2020',
                  'y': 75.0
                },
                {
                  'x': '13/08/2020',
                  'y': 25.0
                },
                {
                  'x': '14/08/2020',
                  'y': 0.0
                },
                {
                  'x': '18/08/2020',
                  'y': 46.43
                },
                {
                  'x': '20/08/2020',
                  'y': 50.0
                },
                {
                  'x': '27/08/2020',
                  'y': 25.0
                },
                {
                  'x': '04/09/2020',
                  'y': 25.0
                },
                {
                  'x': '07/09/2020',
                  'y': 25.0
                },
                {
                  'x': '01/11/2020',
                  'y': 75.0
                },
                {
                  'x': '02/11/2020',
                  'y': 25.0
                },
                {
                  'x': '03/11/2020',
                  'y': 50.0
                },
                {
                  'x': '04/11/2020',
                  'y': 100.0
                },
                {
                  'x': '05/11/2020',
                  'y': 25.0
                },
                {
                  'x': '06/11/2020',
                  'y': 100.0
                }
              ]
            },
            {
              'name': 'Q5',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 40.0
                },
                {
                  'x': '11/08/2020',
                  'y': 40.0
                },
                {
                  'x': '13/08/2020',
                  'y': 40.0
                },
                {
                  'x': '14/08/2020',
                  'y': 40.0
                },
                {
                  'x': '18/08/2020',
                  'y': 27.14
                },
                {
                  'x': '20/08/2020',
                  'y': 40.0
                },
                {
                  'x': '27/08/2020',
                  'y': 25.0
                },
                {
                  'x': '04/09/2020',
                  'y': 25.0
                },
                {
                  'x': '07/09/2020',
                  'y': 25.0
                },
                {
                  'x': '01/11/2020',
                  'y': 25.0
                },
                {
                  'x': '02/11/2020',
                  'y': 40.0
                },
                {
                  'x': '03/11/2020',
                  'y': 25.0
                },
                {
                  'x': '04/11/2020',
                  'y': 40.0
                },
                {
                  'x': '05/11/2020',
                  'y': 25.0
                },
                {
                  'x': '06/11/2020',
                  'y': 40.0
                }
              ]
            },
            {
              'name': 'Q6',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 62.5
                },
                {
                  'x': '11/08/2020',
                  'y': 100.0
                },
                {
                  'x': '13/08/2020',
                  'y': 100.0
                },
                {
                  'x': '14/08/2020',
                  'y': 100.0
                },
                {
                  'x': '18/08/2020',
                  'y': 89.29
                },
                {
                  'x': '20/08/2020',
                  'y': 100.0
                },
                {
                  'x': '27/08/2020',
                  'y': 100.0
                },
                {
                  'x': '04/09/2020',
                  'y': 100.0
                },
                {
                  'x': '07/09/2020',
                  'y': 100.0
                },
                {
                  'x': '01/11/2020',
                  'y': 100.0
                },
                {
                  'x': '02/11/2020',
                  'y': 100.0
                },
                {
                  'x': '03/11/2020',
                  'y': 100.0
                },
                {
                  'x': '04/11/2020',
                  'y': 25.0
                },
                {
                  'x': '05/11/2020',
                  'y': 100.0
                },
                {
                  'x': '06/11/2020',
                  'y': 100.0
                }
              ]
            },
            {
              'name': 'Q7',
              'data': [
                {
                  'x': '10/08/2020',
                  'y': 25.0
                },
                {
                  'x': '11/08/2020',
                  'y': 25.0
                },
                {
                  'x': '13/08/2020',
                  'y': 25.0
                },
                {
                  'x': '14/08/2020',
                  'y': 25.0
                },
                {
                  'x': '18/08/2020',
                  'y': 50.0
                },
                {
                  'x': '20/08/2020',
                  'y': 100.0
                },
                {
                  'x': '27/08/2020',
                  'y': 25.0
                },
                {
                  'x': '04/09/2020',
                  'y': 25.0
                },
                {
                  'x': '07/09/2020',
                  'y': 25.0
                },
                {
                  'x': '01/11/2020',
                  'y': 100.0
                },
                {
                  'x': '02/11/2020',
                  'y': 25.0
                },
                {
                  'x': '03/11/2020',
                  'y': 25.0
                },
                {
                  'x': '04/11/2020',
                  'y': 25.0
                },
                {
                  'x': '05/11/2020',
                  'y': 100.0
                },
                {
                  'x': '06/11/2020',
                  'y': 25.0
                }
              ]
            }
          ],
          chart: {
            toolbar: {
              show: false
            },
            type: 'heatmap'
          },
          plotOptions: {
            heatmap: {
              shadeIntensity: 0.5,
              colorScale: {
                ranges: [
                  {
                    from: -30,
                    to: 5,
                    name: 'low',
                    color: '#00A100'
                  },
                  {
                    from: 6,
                    to: 20,
                    name: 'medium',
                    color: '#128FD9'
                  },
                  {
                    from: 21,
                    to: 45,
                    name: 'high',
                    color: '#FFB200'
                  },
                  {
                    from: 46,
                    to: 55,
                    name: 'extreme',
                    color: '#FF0000'
                  }
                ]
              }
            }
          },
          dataLabels: {
            enabled: false
          },
          title: {
            text: 'HeatMap Chart with Color Range'
          }
        }
      }
    };
  }

  ngOnInit() {
    if (this.chart.chartOptions) this.setDefaultOptions(this.chart.chartOptions);
    this.setPersonalData();
  }

  setPersonalData() {
    this.name = `${this.user.personalData.name} ${this.user.personalData.lastName}`;
    this.email = this.user.personalData.email.personal[0] || this.user.personalData.email.professional[0] || null
  }

  seeDashboard(mep: MatExpansionPanel) {
    mep.disabled = false;
    mep.close();

    setTimeout(() => {
      this.showDashboard = true;
      mep.open();
      mep.disabled = true;
    }, 500);

  }

  setChartSize() {
    const innerWidth = this.innerWidth;
    if (innerWidth < 360) {
      this.chartSize = { width: 80 };
    } else if (innerWidth < 400 && innerWidth > 360) {
      this.chartSize = { width: 100 };
    } else if (innerWidth < 450 && innerWidth > 400) {
      this.chartSize = { width: 150 };

    } else if (innerWidth >= 450 && innerWidth < 600) {
      this.chartSize = { width: 200 };

    } else if (innerWidth >= 600 && innerWidth < 800) {
      this.chartSize = { width: 250 };

    } else {
      this.chartSize = { width: 280 };
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log('innerWidth', window.innerWidth);
    this.innerWidth = window.innerWidth;
    this.setChartSize();

  }

  goToSurvey() {

  }
}
