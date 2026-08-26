using MediatR;

namespace FlowForge.Application.Features.Reports.Export;

public sealed record ExportWorkItemsXlsxQuery : IRequest<ExportWorkItemsXlsxResponse>;