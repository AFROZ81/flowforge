using MediatR;

namespace FlowForge.Application.Features.Reports.Export;

public sealed record ExportWorkItemsCsvQuery : IRequest<ExportWorkItemsCsvResponse>;