using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.GetLabels;

public sealed record GetLabelsQuery : IRequest<ApiResponse<List<GetLabelsResponse>>>;