import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';
import taskService from '@/services/Tasks/taskService';
import ProjectList from '@/pages/dashboard/ProjectList';
import toast from 'react-hot-toast';

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    project_id: number;
    user_id: number | null;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    tags: { name: string; color: string }[];
    user?: { id: number; first_name: string; last_name: string };
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    description?: string;
    organisation_id: number;
    tasks: Task[];
}

interface StatisticsData {
    tasks: Task[];
    byStatus: { [key: string]: number };
    byPriority: { [key: string]: number };
}

interface BurndownData {
    actual: [number, number][];
    ideal: [number, number][];
}

const StatisticsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [stats, setStats] = useState<StatisticsData>({ tasks: [], byStatus: {}, byPriority: {} });
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [selectedProjectForList, setSelectedProjectForList] = useState<Project | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!projectId) {
                toast.error('ID du projet manquant.');
                setLoading(false);
                return;
            }

            try {
                const response = await taskService.getStatistics(parseInt(projectId));
                const data = response.data.data;
                setStats(data);
                setProjectName(data?.tasks[0]?.project_name || `Projet ${projectId}`);
                setSelectedProjectForList({
                    id: parseInt(projectId),
                    name: data?.tasks[0]?.project_name || `Projet ${projectId}`,
                    organisation_id: data?.tasks[0]?.project_id || 0,
                    tasks: data.tasks,
                });
                setLoading(false);
            } catch (error) {
                console.error('Échec du chargement des statistiques:', error);
                toast.error('Échec du chargement des statistiques.');
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [projectId]);

    const handleSelectProject = (project: Project | null) => {
        if (project) {
            navigate(`/statistics/${project.id}`);
        } else {
            navigate('/dashboard');
        }
    };

    const handleGoBack = () => {
        if (selectedProjectForList) {
            navigate('/dashboard', { state: { selectedProjectId: selectedProjectForList.id } });
        } else {
            navigate('/dashboard');
        }
    };

    const generateBurndownData = (tasks: Task[]): BurndownData => {
        if (tasks?.length === 0) {
            return { actual: [], ideal: [] };
        }

        // Filter tasks that have due dates and get the date range
        const tasksWithDueDates = tasks.filter(task => task.due_date);

        if (tasksWithDueDates.length === 0) {
            return { actual: [], ideal: [] };
        }

        const dates = tasksWithDueDates
            .map((task) => new Date(task.due_date!).getTime())
            .filter((date) => !isNaN(date));

        const startDate = new Date(Math.min(...dates));
        const endDate = new Date(Math.max(...dates));
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const dateRange: Date[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const totalTasks = tasksWithDueDates.length;
        const actual: [number, number][] = [];

        dateRange.forEach((date) => {
            const timestamp = date.getTime();
            const completedTasks = tasksWithDueDates.filter(
                (task) =>
                    task.status === 'done' &&
                    task.due_date &&
                    new Date(task.due_date).getTime() <= timestamp
            ).length;
            const remainingTasks = totalTasks - completedTasks;
            actual.push([timestamp, remainingTasks]);
        });

        const ideal: [number, number][] = [];
        const days = dateRange.length;
        const tasksPerDay = totalTasks / (days - 1 || 1);
        dateRange.forEach((date, index) => {
            const timestamp = date.getTime();
            const remaining = Math.max(0, totalTasks - tasksPerDay * index);
            ideal.push([timestamp, remaining]);
        });

        return { actual, ideal };
    };

    const burndownData = generateBurndownData(stats.tasks);

    const burndownOptions: Highcharts.Options = {
        title: {
            text: 'Graphique de Burndown',
            style: { fontSize: '16px', fontWeight: 'bold' },
        },
        xAxis: {
            type: 'datetime',
            title: { text: 'Date d\'échéance' },
            dateTimeLabelFormats: { day: '%e %b' },
        },
        yAxis: {
            title: { text: 'Tâches restantes' },
            min: 0,
        },
        series: [
            {
                type: 'line',
                name: 'Réel',
                data: burndownData.actual,
                color: '#FF0000',
                marker: { enabled: true, radius: 3 },
            },
            {
                type: 'line',
                name: 'Idéal',
                data: burndownData.ideal,
                color: '#00FF00',
                dashStyle: 'Dash',
                marker: { enabled: false },
            },
        ],
        tooltip: {
            shared: true,
            formatter: function () {
                return `<b>${Highcharts.dateFormat('%e %b %Y', this.x)}</b><br/>` +
                    this.points?.map(
                        (point) =>
                            `${point.series.name}: ${point.y} tâche${point.y !== 1 ? 's' : ''}`
                    ).join('<br/>');
            },
        },
        credits: { enabled: false },
        chart: { height: 300 },
        responsive: {
            rules: [
                {
                    condition: { maxWidth: 768 },
                    chartOptions: {
                        chart: { height: 280 },
                        title: { style: { fontSize: '14px' } },
                        xAxis: {
                            title: { style: { fontSize: '11px' } },
                            labels: { style: { fontSize: '10px' } }
                        },
                        yAxis: {
                            title: { style: { fontSize: '11px' } },
                            labels: { style: { fontSize: '10px' } }
                        },
                        legend: { itemStyle: { fontSize: '11px' } },
                    },
                },
                {
                    condition: { maxWidth: 480 },
                    chartOptions: {
                        chart: { height: 250 },
                        title: { style: { fontSize: '12px' } },
                        xAxis: {
                            title: { style: { fontSize: '10px' } },
                            labels: { style: { fontSize: '9px' } }
                        },
                        yAxis: {
                            title: { style: { fontSize: '10px' } },
                            labels: { style: { fontSize: '9px' } }
                        },
                        legend: { itemStyle: { fontSize: '10px' } },
                    },
                },
            ],
        },
    };

    const priorityOptions: Highcharts.Options = {
        chart: { type: 'pie', height: 280 },
        title: {
            text: 'Tâches par Priorité',
            style: { fontSize: '16px', fontWeight: 'bold' },
        },
        series: [
            {
                type: 'pie',
                name: 'Tâches',
                data: [
                    { name: 'Basse', y: stats.byPriority.low || 0, color: '#6B7280' },
                    { name: 'Moyenne', y: stats.byPriority.medium || 0, color: '#FBBF24' },
                    { name: 'Haute', y: stats.byPriority.high || 0, color: '#F97316' },
                    { name: 'Urgente', y: stats.byPriority.urgent || 0, color: '#EF4444' },
                ],
            },
        ],
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)',
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}',
                    style: { fontSize: '12px' },
                },
                size: '85%',
            },
        },
        credits: { enabled: false },
        responsive: {
            rules: [
                {
                    condition: { maxWidth: 768 },
                    chartOptions: {
                        chart: { height: 260 },
                        title: { style: { fontSize: '14px' } },
                        plotOptions: {
                            pie: {
                                dataLabels: { style: { fontSize: '10px' } },
                                size: '90%',
                            },
                        },
                    },
                },
                {
                    condition: { maxWidth: 480 },
                    chartOptions: {
                        chart: { height: 240 },
                        title: { style: { fontSize: '12px' } },
                        plotOptions: {
                            pie: {
                                dataLabels: {
                                    style: { fontSize: '9px' },
                                    format: '{point.y}',
                                },
                                size: '95%',
                            },
                        },
                    },
                },
            ],
        },
    };

    const statusOptions: Highcharts.Options = {
        chart: { type: 'column', height: 280 },
        title: {
            text: 'Tâches par Statut',
            style: { fontSize: '16px', fontWeight: 'bold' },
        },
        xAxis: {
            categories: ['À faire', 'En cours', 'En révision', 'Terminé'],
            title: { text: 'Statut' },
            labels: { style: { fontSize: '12px' } },
        },
        yAxis: {
            title: { text: 'Nombre de tâches' },
            min: 0,
            allowDecimals: false,
        },
        series: [
            {
                type: 'column',
                name: 'Tâches',
                data: [
                    stats.byStatus.todo || 0,
                    stats.byStatus['in-progress'] || 0,
                    stats.byStatus.review || 0,
                    stats.byStatus.done || 0,
                ],
                color: '#3B82F6',
            },
        ],
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>',
        },
        plotOptions: {
            column: {
                dataLabels: { enabled: true, format: '{y}', style: { fontSize: '12px' } },
                borderRadius: 2,
            },
        },
        credits: { enabled: false },
        responsive: {
            rules: [
                {
                    condition: { maxWidth: 768 },
                    chartOptions: {
                        chart: { height: 260 },
                        title: { style: { fontSize: '14px' } },
                        xAxis: {
                            title: { style: { fontSize: '11px' } },
                            labels: { style: { fontSize: '10px' } }
                        },
                        yAxis: {
                            title: { style: { fontSize: '11px' } },
                            labels: { style: { fontSize: '10px' } }
                        },
                        plotOptions: {
                            column: { dataLabels: { style: { fontSize: '10px' } } },
                        },
                    },
                },
                {
                    condition: { maxWidth: 480 },
                    chartOptions: {
                        chart: { height: 240 },
                        title: { style: { fontSize: '12px' } },
                        xAxis: {
                            title: { style: { fontSize: '10px' } },
                            labels: {
                                style: { fontSize: '9px' },
                                rotation: -45,
                            }
                        },
                        yAxis: {
                            title: { style: { fontSize: '10px' } },
                            labels: { style: { fontSize: '9px' } }
                        },
                        plotOptions: {
                            column: { dataLabels: { style: { fontSize: '9px' } } },
                        },
                    },
                },
            ],
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats.tasks.length && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-4">
                <h2 className="text-lg font-semibold text-center">Aucune donnée disponible</h2>
                <Button variant="outline" className="mt-3" onClick={handleGoBack}>
                    Retour au tableau de bord
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-3rem)] text-foreground bg-background">
            <aside className="hidden md:flex md:flex-col w-16 bg-gray-50 border-r">
                <ProjectList
                    selectedProject={selectedProjectForList}
                    onSelectProject={handleSelectProject}
                />
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between p-3 lg:p-4 border-b bg-background">
                    <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                        <Button variant="ghost" size="icon" onClick={handleGoBack}>
                            <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                        <h2 className="text-base lg:text-lg font-semibold truncate">
                            <span className="hidden sm:inline">{projectName} - </span>
                            Statistiques
                        </h2>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
                        {/* Burndown Chart */}
                        <Card className="w-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
                                    <span className="hidden sm:inline">Statistiques pour</span>
                                    <span className="truncate">{projectName}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="w-full overflow-hidden">
                                    <HighchartsReact highcharts={Highcharts} options={burndownOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Priority and Status Charts */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm sm:text-base lg:text-lg">
                                        Tâches par Priorité
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="w-full overflow-hidden">
                                        <HighchartsReact highcharts={Highcharts} options={priorityOptions} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm sm:text-base lg:text-lg">
                                        Tâches par Statut
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="w-full overflow-hidden">
                                        <HighchartsReact highcharts={Highcharts} options={statusOptions} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatisticsPage;