using FlowForge.API.Middlewares;
using FlowForge.Application.Common.Exceptions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FlowForge.Tests;

public class ExceptionMiddlewareTests
{
    [Fact]
    public async Task ValidationException_Returns400()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var validationException = new ValidationException(
            new List<ValidationFailure>
            {
                new("Title", "Title is required."),
                new("Priority", "Invalid priority value.")
            }
        );

        var middleware = new ExceptionMiddleware(
            async _ => { throw validationException; },
            NullLogger<ExceptionMiddleware>.Instance
        );

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
        Assert.StartsWith("application/json", context.Response.ContentType);
    }

    [Fact]
    public async Task BadRequestException_Returns400()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var exception = new BadRequestException("Bad request.");

        var middleware = new ExceptionMiddleware(
            async _ => { throw exception; },
            NullLogger<ExceptionMiddleware>.Instance
        );

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
    }

    [Fact]
    public async Task UnhandledException_Returns500()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var exception = new InvalidOperationException("Unexpected error.");

        var middleware = new ExceptionMiddleware(
            async _ => { throw exception; },
            NullLogger<ExceptionMiddleware>.Instance
        );

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
    }
}
